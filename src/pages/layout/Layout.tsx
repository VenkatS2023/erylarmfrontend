import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import github from "../../assets/github.svg";
import styles from "./Layout.module.css";
import AffineLogo from '../../assets/affineLogo.png';
import AffineLogosm from '../../assets/affinelogo_sm.png';
import RetravierLogo from '../../assets/ErylLogo.png';
import React, { useEffect, useState } from "react";
import useCredit from "../../api/userCredit";
import Creditstemplate from "../creditstemplate/credittemplate";

const currentDate = new Date();
const currentYear = currentDate.getFullYear();

const Layout = ({ isAdmin, signOutClickHandler }) => {
  const storedResponse = localStorage.getItem('msalResponse');
  const { creditBalance } = useCredit()
  const [showCreditComponent, setShowCreditComponent] = useState(false);
  const navigate = useNavigate();


  let fullName; // Declare fullName outside of the if statement

  if (storedResponse !== null) {
    try {
      const parsedResponse = JSON.parse(storedResponse);

      if (parsedResponse?.account?.name) {
        fullName = parsedResponse.account.name;
      } else {
        console.log('Full Name not found in storedResponse');
      }
    } catch (error) {
      console.error('Error parsing storedResponse:', error);
    }
  } else {
    console.log('storedResponse is null.');
  }

  const openCreditPage = () => {
    navigate('/layout/creditstemplate');
  };

  return (
    <div className={styles.layout}>
      <header className={styles.header} role={"banner"}>
        <div className={styles.headerContainer}>
          <Link to="/" className={styles.headerTitleContainer}>
            {/*<h3 className={styles.headerTitle}>GPT + Enterprise data | Sample</h3>*/}
            <img src={AffineLogo} className="d-inline-block align-left" alt='Affine' />
            <img src={RetravierLogo} className="d-inline-block align-left" width="80px" />
          </Link>
          <nav>
            <ul className={styles.headerNavList}>
              <li>
                <NavLink to="chat" className={({ isActive }) => (isActive ? styles.headerNavPageLinkActive : styles.headerNavPageLink)}>
                  Chat with Eryl
                </NavLink>
              </li>
              <li className={styles.headerNavLeftMargin}>
                <NavLink to="qa" className={({ isActive }) => (isActive ? styles.headerNavPageLinkActive : styles.headerNavPageLink)}>
                  Ask Eryl
                </NavLink>
              </li>
              <li className={styles.headerNavLeftMargin}>
                <NavLink to="uploads" className={({ isActive }) => (isActive ? styles.headerNavPageLinkActive : styles.headerNavPageLink)}>
                  Uploads
                </NavLink>
              </li>
              {isAdmin && <li className={styles.headerNavLeftMargin}>
                <NavLink to="category" className={({ isActive }) => (isActive ? styles.headerNavPageLinkActive : styles.headerNavPageLink)}>
                  Categories
                </NavLink>
              </li>}
              {isAdmin && <li className={styles.headerNavLeftMargin}>
                <NavLink to="users" className={({ isActive }) => (isActive ? styles.headerNavPageLinkActive : styles.headerNavPageLink)}>
                  Users
                </NavLink>
              </li>}
              {/*<li className={styles.headerNavLeftMargin}>

                                <a href="https://aka.ms/entgptsearch" target={"_blank"} title="Github repository link">
                                    <img
                                        src={github}
                                        alt="Github logo"
                                        aria-label="Link to github repository"
                                        width="20px"
                                        height="20px"
                                        className={styles.githubLogo}
                                    />
                                </a>
                            </li>*/}
            </ul>
          </nav>
          {/* <h4 className={styles.headerRightText}>retrAIver + Azure OpenAI + Cognitive Search</h4> */}
        </div>
        <div
          className="creditsbutton pointer"
          style={{
            width: "max-content",
            height: "32px",
            marginRight: "20px",
            borderRadius: "5px",
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "0 10px 0px 5px",
            backgroundColor: "#12faef85",
          }}
          onClick={openCreditPage}
        >
          <label
            className="credit-text pointer"
            style={{ fontSize: "14px", fontWeight: "400", color: "white" }}
          >
            <i
              className="fa fa-star mx-2 mt-1 "
              aria-hidden="true"
              style={{ width: "max-content" }}
            ></i>
            Credit Balance : {creditBalance}
          </label>
        </div>
        <div
          style={{
            color: "#fff",
            fontSize: "15px",
            margin: "10px",
            whiteSpace: "nowrap",
          }}
        >
          {fullName}
        </div>
        <div
          className="powerbtn"
          style={{
            marginLeft: "8px",
            height: "30px",
            width: "30px",
            alignItems: "center",
            paddingRight: "38px",
            fontSize: "23px",
          }}
        >
          <i
            className="fa fa-power-off"
            onClick={signOutClickHandler}
            title="Logout"
          ></i>
        </div>
      </header>

      <Outlet />
      <footer className={styles.footer}>
        <div className={styles.left_container}>
          <span className={styles.copy_right}>copyright &copy; {currentYear}</span>
        </div>
        <div className={styles.powered}>
          <label className={styles.footertext} >Powered by </label>

          <a href="https://affine.ai" target="_blank" ><img className={styles.footerlogopos} src={AffineLogo} alt="Affine Logo" /></a>
        </div>
      </footer>
      {showCreditComponent && <Creditstemplate />}
    </div>
  );
};

export default Layout;
