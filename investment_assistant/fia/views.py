from django.shortcuts import render
from django.views import View
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse
from rest_framework import generics, status
from .serializers import UserSerializer, PortfolioSerializer, AccountOverviewSerializer, ForumQuestionSerializer, ForumResponseSerializer
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
from .models import Portfolio, AccountOverview, ForumQuestion, ForumResponse
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from sklearn.neighbors import KNeighborsRegressor
from sklearn.ensemble import RandomForestRegressor
from django.core.mail import send_mail
from rest_framework.exceptions import ValidationError
from django.core.exceptions import ObjectDoesNotExist

api_key = 'WSKWF8OYUKBBJ4WT'

def algorithm(stock):
    ts = TimeSeries(key=api_key, output_format='pandas')
    data, meta_data = ts.get_monthly(symbol=str(stock))

    #preprocessing data
    data = data.drop(columns=['1. open', '2. high', '3. low'])
    data.rename(columns={'4. close': 'Close', '5. volume': 'Volume'}, inplace=True)
    data.sort_index(inplace=True)
    data['Volume'] = pd.to_numeric(data['Volume'])

    #Calculate returns & drop empty rows
    data['Returns'] = np.log(data['Close']) - np.log(data['Close'].shift(1))
    data.dropna(inplace=True)

    # defining the predictor variables
    X = data[['Close', 'Volume']]

    # defining the target variable
    y = data['Returns']

    # creating the KNN model
    rf = RandomForestRegressor(n_jobs=-1, oob_score=True, n_estimators=100)

    # fit the model
    rf.fit(X, y)    

    # predict the future price of the stock
    future_data, _ = ts.get_monthly(symbol=str(stock))
    future_close = float(future_data.iloc[0]['4. close'])
    future_volume = int(future_data.iloc[0]['5. volume'])
    future_returns = rf.predict([[future_close, future_volume]])
    future_price = future_close * np.exp(future_returns)

    return future_price


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
        print(groups)
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


class Logout(APIView):
    def post(self, request, *args, **kwargs):
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
                url = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol='+ticker+'&apikey='+api_key
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
                url = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol='+ticker+'&apikey='+api_key
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
            elif request.data.get('action') == 'Buy':
                data = request.data
                ticker = request.data.get('stock_symbol')
                url = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol='+ticker+'&apikey='+api_key
                r = requests.get(url)
                stockpri = r.json()
                data['stock_price'] = stockpri['Global Quote']['05. price']
                temp = AccountOverview.objects.filter(user=User.objects.filter(last_login__isnull=False).latest('last_login'))
                updateVal = temp[0].account_value - (float(data['stock_price']) * float(data['stock_quantity']))
                if Portfolio.objects.filter(user=User.objects.filter(last_login__isnull=False).latest('last_login')).filter(stock_symbol=ticker):
                    entered_quan = data['stock_quantity']
                    curr_quan = Portfolio.objects.filter(user=User.objects.filter(last_login__isnull=False).latest('last_login')).filter(stock_symbol=ticker).get().stock_quantity
                    # if int(data['stock_quantity']) > curr_quan:
                    #     return HttpResponse('You do not own enough quantity')
                    # else:
                    data['stock_quantity'] = str(int(curr_quan) + int(entered_quan))
                    # if int(data['stock_quantity']) > 0:
                    port_serializer = PortfolioSerializer(Portfolio.objects.filter(user=User.objects.filter(last_login__isnull=False).latest('last_login')).filter(stock_symbol=ticker).get(),data={'stock_quantity':data['stock_quantity']}, partial=True)
                    port_serializer.is_valid(raise_exception=True)
                    port_serializer.save()
                    acc_serializer = AccountOverviewSerializer(AccountOverview.objects.filter(user=User.objects.filter(last_login__isnull=False).latest('last_login')).get(), data={'account_value':updateVal}, partial=True)
                    acc_serializer.is_valid(raise_exception=True)
                    acc_serializer.save()
                    return HttpResponse('EXISTS')
                else:
                    return HttpResponse('DOES NOT EXIST')

class PortfolioView(APIView):
    serializer_portfolio = PortfolioSerializer

    def get(self, request, *args, **kwargs):
        if request.method == 'GET':
            # print(User.objects.filter(last_login__isnull=False).latest('last_login'))
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
                # url = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol='+ticker+'&apikey='+api_key
                # r = requests.get(url)
                # stockpri = r.json()
                # cur_pri = stockpri['Global Quote']['05. price']
                # curr_price.append(cur_pri)
                purchasedates.append(i.purchase_date)
                stkprice.append(i.stock_price)
                stkquantity.append(i.stock_quantity)
                total.append(i.stock_price*i.stock_quantity)

            # print(cur_pri)
            acc = AccountOverview.objects.filter(user=User.objects.filter(last_login__isnull=False).latest('last_login'))[0]
            # print(acc.account_value)

            return Response({'symbol': syms, 'purchase_date':purchasedates, 'stock_price': stkprice, 'stock_quantity': stkquantity, 'total': total, 'acc':round(acc.account_value,2)}, status=status.HTTP_200_OK)


class Search(APIView):

    def post(self, request, *args, **kwargs):
        data = request.data
        ticker = request.data.get('stock_symbol')
        url = 'https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords='+ticker+'&apikey='+api_key
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

        #1 YEAR
        url = 'https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol='+str(ticker)+'&apikey='+api_key
        r = requests.get(url)
        data = r.json()
        print(1)
        open = []
        volume = list(data['Monthly Time Series'].items())[0][1]['5. volume']
        high = []
        low = []
        curr_price = list(data['Monthly Time Series'].items())[0][1]['4. close']
        date = []
        close = []
        count = 0
        for i in data['Monthly Time Series']:
            if count == 12:
                break
            date.append(i)
            close.append(data['Monthly Time Series'][i]['4. close'])
            open.append(data['Monthly Time Series'][i]['1. open'])
            high.append(data['Monthly Time Series'][i]['2. high'])
            low.append(data['Monthly Time Series'][i]['3. low'])
            count += 1

        # #1 MONTH
        # url = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol='+str(ticker)+'&apikey='+api_key
        # r = requests.get(url)
        # data = r.json()
        # print(1)
        # open = []
        # volume = list(data['Time Series (Daily)'].items())[0][1]['5. volume']
        # high = []
        # low = []
        # curr_price = list(data['Time Series (Daily)'].items())[0][1]['4. close']
        # date = []
        # close = []
        # count = 0
        # for i in data['Time Series (Daily)']:
        #     if count == 31:
        #         break
        #     date.append(i)
        #     close.append(data['Time Series (Daily)'][i]['4. close'])
        #     open.append(data['Time Series (Daily)'][i]['1. open'])
        #     high.append(data['Time Series (Daily)'][i]['2. high'])
        #     low.append(data['Time Series (Daily)'][i]['3. low'])
        #     count += 1

        #1 day
        # url = 'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol='+str(ticker)+'&interval=60min&apikey='+api_key
        # r = requests.get(url)
        # data = r.json()
        # print(data)
        # open = []
        # volume = list(data['Time Series (60min)'].items())[0][1]['5. volume']
        # high = []
        # low = []
        # curr_price = list(data['Time Series (60min)'].items())[0][1]['4. close']
        # date = []
        # close = []
        # count = 0
        # for i in data['Time Series (60min)']:
        #     if count == 24:
        #         break
        #     date.append(i)
        #     close.append(data['Time Series (60min)'][i]['4. close'])
        #     open.append(data['Time Series (60min)'][i]['1. open'])
        #     high.append(data['Time Series (60min)'][i]['2. high'])
        #     low.append(data['Time Series (60min)'][i]['3. low'])
        #     count += 1

        lisData = []
        for i in range(0, len(date)):
            temp = []
            temp.append(date[i])
            temp.append(float(low[i]))
            temp.append(float(open[i]))
            temp.append(float(close[i]))
            temp.append(float(high[i]))
            lisData.insert(0,temp)
        
        lisData.insert(0,['Year', 'low', 'open', 'close', 'high'])

        future_price = algorithm(ticker)
        prediction = ''
        print(open)


        if future_price > float(curr_price):
            prediction = 'It would be a good decision to buy this stock!'
        else:
            prediction = 'It would be better to hold or sell this stock if you have invested!'

        print(prediction)
        return Response({'lisData': lisData,'chart_date': date, 'chart_close': close, 'open': open, 'volume': volume, 'high': high, 'low': low, 'curr_price': curr_price, 'prediction': prediction},status=status.HTTP_200_OK)
        # return Response({'lisData': lisData, 'curr_price': curr_price, 'prediction': prediction},status=status.HTTP_200_OK)


class AllPortfolios(APIView):

    def get(self, request, *args, **kwargs):
        if request.method == 'GET':
            p = Portfolio.objects.all().values()
            # print(p)
            portfolios = []
            for i in p:
                print(i)
                temp = []
                temp.append(i['stock_symbol'])
                temp.append(i['purchase_date'])
                temp.append(i['stock_price'])
                temp.append(i['stock_quantity'])
                u = User.objects.filter(id=i['user_id']).get()
                temp.append(u.username)
                # print(u)
                portfolios.append(temp)

            return Response({'portfolios': portfolios}, status=status.HTTP_200_OK)


class ForumQuestions(APIView):

    def get(self, request, *args, **kwargs):
        if request.method == 'GET':
            q = ForumQuestion.objects.all().values()
            quesList = []
            for i in q:
                temp = []
                temp.append(i['id'])
                temp.append(i['question'])
                temp.append(User.objects.filter(id=i['user_id']).get().username)
                quesList.append(temp)
            # print(quesList)

            return Response({'questions': quesList}, status=status.HTTP_200_OK)


    def post(self, request, *args, **kwargs):
        if request.method == 'POST':
            data = request.data 
            forum_serializer = ForumQuestionSerializer(data=data)
            if forum_serializer.is_valid():
                forum_serializer.save(user=User.objects.filter(last_login__isnull=False).latest('last_login'))
                return Response(forum_serializer.data, status=status.HTTP_201_CREATED)
            return Response(forum_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ForumAnswers(APIView):

    def get(self, request, *args, **kwargs):
        if request.method == 'GET':
            a = ForumResponse.objects.all().values()
            resList = []
            for i in a:
                temp = []
                # print(i)
                temp.append(i['belongs_to_id'])
                temp.append(i['response'])
                temp.append(User.objects.filter(id=i['user_id']).get().username)
                resList.append(temp)
            # print(resList)

            return Response({'response': resList}, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        if request.method == 'POST':
            data = request.data 
            forum_serializer = ForumResponseSerializer(data=data)
            if forum_serializer.is_valid():
                forum_serializer.save(user=User.objects.filter(last_login__isnull=False).latest('last_login'))
                return Response(forum_serializer.data, status=status.HTTP_201_CREATED)
            return Response(forum_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordReset(APIView):

    def post(self, request, *args, **kwargs):
        if request.method == 'POST':
            email = request.data.get('resetEmail')
            try:
                userid = User.objects.filter(username=email).get().id
                # print(user)
                link = "http://localhost:3000/newpassword/" + str(userid)
                msg = "This email is being sent because you have requested to reset your password, please click on the following link to reset your password: " + link
                send_mail(
                    'Password Reset',
                    msg,
                    'manasafzal123@gmail.com',
                    [email],
                    fail_silently=False,
                )
                return Response({"userid":userid},status=status.HTTP_200_OK)
            except ObjectDoesNotExist:
                return HttpResponse("User with this email does not exist")
            except Exception as e:
                return HttpResponse("An error occurred while processing your request")


    def put(self, request, *args, **kwargs):
        if request.method == 'PUT':   
            data = request.data 
            userid = data.get('userid')
            password = data.get('password')

            # user_serializer = UserSerializer(User.objects.filter(id=userid).get(),data={'password':password},partial=True)
            # user_serializer.is_valid(raise_exception=True)
            # user_serializer.save()
            u = User.objects.filter(id=userid).get()
            u.set_password(password)
            u.save()

            return HttpResponse("Password updated successfully")


