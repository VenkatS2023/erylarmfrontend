import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AffineLogo from "../../assets/affineLogo.png";
import styles from "./login.module.css";
import RetravierLogo from "../../assets/ErylLogo.png";
import { trackPromise } from "react-promise-tracker";
import usercreditsService from "../../api/creditmanagementService";
import useCredit from "../../api/userCredit";

const Login = ({ setIsAdmin, msalInstance }) => {
  const navigate = useNavigate();
  const [loginFailed, setLoginFailed] = useState(false);
  const { setCreditBalance } = useCredit();

  // Initialize the MSAL instance
  useEffect(() => {
    async function initializeMsal() {
      try {
        await msalInstance.handleRedirectPromise(); // Handles the redirect from Azure AD
      } catch (error) {
        console.error("Initialization error:", error);
      }
    }
    initializeMsal();
  }, []); // Empty dependency array ensures it runs only once when the component mounts

  const submitHandler = async () => {

    let userAccount;
    try {
      const accounts = msalInstance.getAllAccounts();

      if (accounts.length > 0) {
        const userAccount = accounts[0];

        const silentRequest = {
          scopes: [
            // Scopes here
          ],
          account: userAccount,
        };

        try {
          const response = await msalInstance.acquireTokenSilent(silentRequest);
          // console.log(response)
          localStorage.setItem('msalResponse', JSON.stringify(response));
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('email', response.account.username);
          localStorage.setItem('name', response.account.name)
          // console.log(response.account?.name)
          // Extract user information
          const userInformation = {
            name: userAccount.name,
            email: userAccount.username, // Assuming the email is stored in the username field
            accessToken: response.accessToken,
            expirationTime: response.expiresOn,
            lastLoggedIn: new Date().toISOString(), // You can replace this with the actual last login time
          };

          // Call usercredits function with user information
          usercredits(userInformation);

        } catch (silentError) {
          console.error('Silent login failed:', silentError);

          // Handle silent login failure, you can fall back to interactive login if needed
          // ...
        }
      } else {
        try {
          const loginResponse = await msalInstance.loginPopup({
            scopes: [
              // Scopes for interactive login
            ],
          });
          // Store the response and access token in localStorage
          localStorage.setItem('msalResponse', JSON.stringify(loginResponse));
          localStorage.setItem('accessToken', loginResponse.accessToken);
          localStorage.setItem('email', loginResponse.account.username);
          localStorage.setItem('name', loginResponse.account.name)

          // Extract user information
          const userInformation = {
            name: loginResponse.account.name,
            email: loginResponse.account.username, // Assuming the email is stored in the username field
            accessToken: loginResponse.accessToken,
            expirationTime: loginResponse.expiresOn,
            lastLoggedIn: new Date().toISOString(), // You can replace this with the actual last login time
          };

          // Call usercredits function with user information
          usercredits(userInformation);
          // console.log('Interactive login successful!', loginResponse);
        } catch (interactiveError) {
          console.error('Interactive login failed:', interactiveError);
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const usercredits = (userInfo) => {
    trackPromise(
      usercreditsService
        .userdata(userInfo)
        .then((response) => {
          // Process the response if needed
          const { role, balance } = response.data;
          localStorage.setItem("role", role);
          // localStorage.setItem("status",status)
          if (response.data.status !== 1) {
            setLoginFailed(true);
            sessionStorage.clear();
            localStorage.clear();
          } else {
            setLoginFailed(false);
            setIsAdmin(role === "Admin");
            setCreditBalance(balance);
            navigate("/layout/chat");
          }

        })
        .catch((err) => {
          alert(err.response.data.error);
          setLoginFailed(true);
          sessionStorage.clear();
          localStorage.clear();
        })
    );
  };

  return (
    <div>
      <header className={styles.header} role={"banner"}>
        <div className={styles.headerContainer}>
          <Link to="/" className={styles.headerTitleContainer}>
            <img
              src={AffineLogo}
              className="d-inline-block align-left"
              alt="Affine"
            />
            <img
              src={RetravierLogo}
              className="d-inline-block align-left"
              width="80px"
            />
          </Link>
        </div>
      </header>
      <div className="login-container">
        <div className="login-container">
          <div className="login1 div-wrapper d-flex justify-content-center mt-5">
            <div className="logincard">
              <h2 className="header-group mb-3">Sign In</h2>
              <form autoComplete="off">
                <div className="form-group col-md-12 text-center">
                  <button
                    type="button"
                    className="btn btn-primary login-btn mt-1"
                    style={{ height: "47px" }}
                    onClick={submitHandler}
                  >
                    <span style={{ color: "#ffff" }}>
                      Sign in with your Microsoft account
                    </span>
                  </button>
                  {loginFailed && (
                    <div style={{ color: "red", marginTop: "10px" }}>
                      You do not have access to this application, Please contact your Administrator.
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
