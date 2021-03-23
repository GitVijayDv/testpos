import { Button, notification } from 'antd';
import React, { useContext, useEffect, useState } from 'react';
import styles from './style.less';
import LoginFrom from './components/Login';
import axios from '../../components/axios';
import StoreContext from '../../provider/store';
import { CloseCircleOutlined } from '@ant-design/icons';
const { Tab, UserName, Password } = LoginFrom;

const Login = props => {
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState('account');
  const context = useContext(StoreContext);

  useEffect(() => {
    if (context.user !== null) {
      props.history.push('/pos');
    } else if (localStorage.getItem("InsightOpsPOSUser") !== null){
      context.setUser(JSON.parse(localStorage.getItem("InsightOpsPOSUser")))
      props.history.push('/pos');
    }
  }, []);

  const handleSubmit = values => {
    setIsLoading(true);
    axios
      .post('/restaurant/team/login', {
        email: values.userName,
        password: values.password,
      })
      .then(u => {
        if (u.data.status) {
          localStorage.setItem('InsightOpsPOSUser', JSON.stringify(u.data.user));
          context.setUser(u.data.user);
          setIsLoading(false);
          props.history.push('/pos');
        } else {
          setIsLoading(false);
          notification.open({
            message: "Can't Login",
            description: 'Please Check The email and password',
            icon: <CloseCircleOutlined style={{ color: 'red' }} />,
          });
        }
      })
      .catch(e => {
        setIsLoading(false);
        notification.open({
          message: "Can't Login",
          description: "Something went wrong, please check the credientials you've provided",
          icon: <CloseCircleOutlined style={{ color: 'red' }} />,
        });
      });
  };

  return (
    <div
      style={{
        backgroundImage: `url(${require('../../assets/loginbg.svg')})`,
        height: '100%',
        width: '100%',
        paddingTop: "54px"
      }}
    >
      <div className={styles.main}>
        <div>
          <center>
            <h1 style={{marginBottom: "2px"}}>InsightOps POS Login</h1>
          </center>
          <center>
            <h3 style={{color: "#848484d9", paddingBottom: "8px"}}>Please provide credentials to login</h3>
          </center>
        </div>
        <LoginFrom activeKey={type} onTabChange={setType} onSubmit={handleSubmit}>
          <Tab key="account" tab="POS User">
            <UserName
              name="userName"
              placeholder="admin or user"
              rules={[
                {
                  required: true,
                  message: 'Provide Email!',
                },
              ]}
            />
            <Password
              name="password"
              placeholder="Password"
              rules={[
                {
                  required: true,
                  message: 'Provide Password',
                },
              ]}
            />
          </Tab>
          <Button loading={isLoading} htmlType="submit" style={{ width: '100%' }} type="primary">
            Login
          </Button>
        </LoginFrom>
      </div>
    </div>
  );
};

export default Login;
