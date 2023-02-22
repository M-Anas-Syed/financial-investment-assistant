from django.shortcuts import render
from django.views import View
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse
from rest_framework import generics, status
from .serializers import UserSerializer, PortfolioSerializer, AccountOverviewSerializer
from rest_framework import viewsets
from django.contrib.auth import authenticate
from rest_framework.permissions import AllowAny
from django.contrib.auth import login, logout
from rest_framework.authtoken.models import Token
from django.views.decorators.csrf import csrf_protect
from django.http import HttpResponse
from django.shortcuts import redirect
from django.urls import reverse
from django.contrib.auth.models import Group, AnonymousUser
from django.contrib.auth.models import User
import requests
import json
from alpha_vantage.timeseries import TimeSeries
from datetime import date
from .models import Portfolio, AccountOverview


api_key = 'WSKWF8OYUKBBJ4WT'

def index(request, *args, **kwargs):
    return render(request, 'index.html')

class RegisterView(APIView):
    permission_classes = [AllowAny]
    serializer_class = UserSerializer
    account_serializer = AccountOverviewSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        user.set_password(user.password)
        group = Group.objects.get(name='Customer')
        group.user_set.add(user)

        serializer2 = self.account_serializer(data={"user": user.id})
        serializer2.is_valid(raise_exception=True)
        account_info = serializer2.save()
        account_info.save()

        user.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        print(request.session.get('user_id'))
        # for key, value in request.session.items():
        #     print('{} => {}'.format(key, value))
        last_login_user = User.objects.filter(last_login__isnull=False).latest('last_login')
        groups = last_login_user.groups.all()
        role = groups[0]
        return Response(str(role),status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)
        if user is None:
            return Response({'error': 'Invalid Login'}, status=status.HTTP_400_BAD_REQUEST)
        
        if user.is_active:
            login(request, user)
            request.session['user_id'] = user.id
            print(request.session.get('user_id'))
            return Response({'userid': request.session.get('user_id')}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Your account is disabled'}, status=status.HTTP_400_BAD_REQUEST)


    def logout(self, request, *args, **kwargs):
        if request.method == 'POST':
            # logout(request)
            # last_login_user = User.objects.filter(last_login__isnull=False).latest('last_login')
            # groups = last_login_user.groups.all()
            # role = groups[0]
            # print(last_login_user)
            print(request.session.get('user_id'))
            logout(request)
            if isinstance(request.user, AnonymousUser):
                return HttpResponse("You have been successfully logged out.")
            else:
                return HttpResponse("Logout failed.")


class Action(APIView):
    def post(self, request, *args, **kwargs):
        
        # print(Portfolio.objects.filter(user=User.objects.filter(last_login__isnull=False).latest('last_login')).latest('purchase_date').value)
        if request.method == 'POST':
            if request.data.get('action') == 'Buy':
                data = request.data
                data['purchase_date'] = date.today() 
                ticker = request.data.get('stock_symbol')
                url = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol='+ticker+'&apikey=WSKWF8OYUKBBJ4WT'
                r = requests.get(url)
                stockinfo = r.json()
                data['stock_price'] = stockinfo['Global Quote']['05. price']
                temp = AccountOverview.objects.filter(user=User.objects.filter(last_login__isnull=False).latest('last_login'))
                # print(temp[0].account_value)
                updateVal = temp[0].account_value - (float(data['stock_price']) * float(data['stock_quantity']))
                # print(AccountOverview.objects.filter(user=User.objects.filter(last_login__isnull=False).latest('last_login')).get())
                acc_serializer = AccountOverviewSerializer(AccountOverview.objects.filter(user=User.objects.filter(last_login__isnull=False).latest('last_login')).get(), data={'account_value':updateVal}, partial=True)
                acc_serializer.is_valid(raise_exception=True)
                acc_serializer.save()
                # print(acc_serializer)
                # temp.account_value = updateVal
                # temp.save()
                serializer = PortfolioSerializer(data=data)
                if serializer.is_valid():
                    serializer.save(user=User.objects.filter(last_login__isnull=False).latest('last_login'))
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, *args, **kwargs):
        if request.method == 'PUT':         
            if request.data.get('action') == 'Sell':
                data = request.data
                ticker = request.data.get('stock_symbol')
                url = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol='+ticker+'&apikey=WSKWF8OYUKBBJ4WT'
                r = requests.get(url)
                stockpri = r.json()
                data['stock_price'] = stockpri['Global Quote']['05. price']
                temp = AccountOverview.objects.filter(user=User.objects.filter(last_login__isnull=False).latest('last_login'))
                updateVal = temp[0].account_value + (float(data['stock_price']) * float(data['stock_quantity']))
                if Portfolio.objects.filter(user=User.objects.filter(last_login__isnull=False).latest('last_login')).filter(stock_symbol=ticker):
                    entered_quan = data['stock_quantity']
                    curr_quan = Portfolio.objects.filter(user=User.objects.filter(last_login__isnull=False).latest('last_login')).filter(stock_symbol=ticker).get().stock_quantity
                    if int(data['stock_quantity']) > curr_quan:
                        return HttpResponse('You do not own enough quantity')
                    else:
                        data['stock_quantity'] = str(int(curr_quan) - int(entered_quan))
                        if int(data['stock_quantity']) > 0:
                            port_serializer = PortfolioSerializer(Portfolio.objects.filter(user=User.objects.filter(last_login__isnull=False).latest('last_login')).filter(stock_symbol=ticker).get(),data={'stock_quantity':data['stock_quantity']}, partial=True)
                            port_serializer.is_valid(raise_exception=True)
                            port_serializer.save()
                        else:
                            Portfolio.objects.filter(user=User.objects.filter(last_login__isnull=False).latest('last_login')).filter(stock_symbol=ticker).delete()
                    acc_serializer = AccountOverviewSerializer(AccountOverview.objects.filter(user=User.objects.filter(last_login__isnull=False).latest('last_login')).get(), data={'account_value':updateVal}, partial=True)
                    acc_serializer.is_valid(raise_exception=True)
                    acc_serializer.save()
                    return HttpResponse('EXISTS')
                else:
                    return HttpResponse('DOES NOT EXIST')
                # data['value'] = temp + (float(data['stock_price']) * float(data['stock_quantity']))
                # serializer = PortfolioSerializer(data=data)


class PortfolioView(APIView):
    serializer_portfolio = PortfolioSerializer

    def get(self, request, *args, **kwargs):
        if request.method == 'GET':
            print(User.objects.filter(last_login__isnull=False).latest('last_login'))
            p = Portfolio.objects.filter(user=User.objects.filter(last_login__isnull=False).latest('last_login'))
            syms = []
            purchasedates = []
            stkprice = []
            stkquantity = []
            total = []
            curr_price = []
            for i in p:
                syms.append(i.stock_symbol)
                ticker = i.stock_symbol
                url = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol='+ticker+'&apikey=WSKWF8OYUKBBJ4WT'
                r = requests.get(url)
                stockpri = r.json()
                print(stockpri['Global Quote']['05. price'])
                curr_price.append(stockpri['Global Quote']['05. price'])
                purchasedates.append(i.purchase_date)
                stkprice.append(i.stock_price)
                stkquantity.append(i.stock_quantity)
                total.append(i.stock_price*i.stock_quantity)

            acc = AccountOverview.objects.filter(user=User.objects.filter(last_login__isnull=False).latest('last_login'))[0]
            # print(acc.account_value)

            return Response({'symbol': syms, 'purchase_date':purchasedates, 'stock_price': stkprice, 'stock_quantity': stkquantity, 'total': total, 'acc':acc.account_value, 'curr_price': curr_price}, status=status.HTTP_200_OK)


class Search(APIView):

    def post(self, request, *args, **kwargs):
        data = request.data
        ticker = request.data.get('stock_symbol')
        url = 'https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords='+ticker+'&apikey=WSKWF8OYUKBBJ4WT'
        r = requests.get(url)
        data = r.json()

        symbols = []
        for i in range(len(data['bestMatches'])):
            temp = {}
            temp['id'] = i
            temp['name'] = data['bestMatches'][i]['1. symbol']
            symbols.append(temp)

        return Response({'suggested_symbols': symbols}, status=status.HTTP_200_OK)

class Chart(APIView):
    def post(self, request, *args, **kwargs):
        data = request.data 
        ticker = request.data.get('symbol')
        url = 'https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol='+str(ticker)+'&apikey=WSKWF8OYUKBBJ4WT'
        r = requests.get(url)
        data = r.json()

        date = []
        close = []

        for i in data['Monthly Time Series']:
            date.append(i)
            close.append(data['Monthly Time Series'][i]['4. close'])

        return Response({'chart_date': date, 'chart_close': close},status=status.HTTP_200_OK)


#Algorithm
# def get_stock_data(symbol):
#     url = f'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol={symbol}&apikey={API_KEY}'
#     response = requests.get(url)
#     if response.status_code == 200:
#         data = response.json()
#         return data['Time Series (Daily)']
#     else:
#         return None

# def generate_signals(symbol, threshold=1.1):
#     data = get_stock_data(symbol)
#     if data is None:
#         return None
    
#     prices = []
#     for date, values in data.items():
#         prices.append(float(values['4. close']))
    
#     # Calculate the moving averages
#     short_ma = sum(prices[-5:]) / 5
#     long_ma = sum(prices[-20:]) / 20
    
#     # Check if the short moving average crosses the long moving average
#     if short_ma > long_ma * threshold:
#         return 'buy'
#     elif short_ma < long_ma / threshold:
#         return 'sell'
#     else:
#         return 'hold'