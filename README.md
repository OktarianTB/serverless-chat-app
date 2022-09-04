# Serverless Chat App

### Background
I created a real-time chat application using a serverless architecture. This app leverages [serverless-stack](https://sst.dev/) to easily deploy resources to AWS, including to Lambda, DynamoDB, and API Gateway.
I built a simple React frontend using the [chat-ui-kit](https://github.com/chatscope/chat-ui-kit-react).

![Screenshot 2022-09-04 at 23 19 33](https://user-images.githubusercontent.com/47431024/188335589-8f00b5ea-1a4e-42e1-a77b-6b0652e472d7.png)


### Installation

Configure the AWS CLI:
```
aws configure
```

Install dependencies:
```
npm install
cd services/
npm install
```

Then to run:
```
npm start
cd frontend/
npm start
```

To delete the created resources:
```
npm run remove
```
