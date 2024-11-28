import React from 'react';
import '../assets/footer.css'

const Footer = () => {
  return (
    <footer className="footer" data-section>
      <div className="container">

        <div className="footer-top">

          <ul className="footer-list">
            <li>
              <p className="footer-list-title">Company</p>
            </li>

            <li>
              <p className="footer-list-text">
                Find a location nearest you. See <a href="#" className="link">Our Stores</a>
              </p>
            </li>

            <li>
              <p className="footer-list-text bold">+391 (0)35 2568 4593</p>
            </li>

            <li>
              <p className="footer-list-text">darmeze@domain.com</p>
            </li>
          </ul>

          <ul className="footer-list">
            <li>
              <p className="footer-list-title">Useful links</p>
            </li>

            <li>
              <a href="#" className="footer-link">New Products</a>
            </li>

            <li>
              <a href="#" className="footer-link">Best Sellers</a>
            </li>

            <li>
              <a href="#" className="footer-link">Bundle & Save</a>
            </li>

            <li>
              <a href="#" className="footer-link">Online Gift Card</a>
            </li>
          </ul>

          <ul className="footer-list">
            <li>
              <p className="footer-list-title">Information</p>
            </li>

            <li>
              <a href="#" className="footer-link">Start a Return</a>
            </li>

            <li>
              <a href="#" className="footer-link">Contact Us</a>
            </li>

            <li>
              <a href="#" className="footer-link">Shipping FAQ</a>
            </li>

            <li>
              <a href="#" className="footer-link">Terms & Conditions</a>
            </li>

            <li>
              <a href="#" className="footer-link">Privacy Policy</a>
            </li>
          </ul>

         

        </div>

        <div className="footer-bottom">

          <div className="wrapper">
          <p className='reserved'>© Dermeze  {new Date().getFullYear()} | All rights reserved</p> 

            <ul className="social-list">
              <li>
                <a href="#" className="social-link">
                  <ion-icon name="logo-twitter"></ion-icon>
                </a>
              </li>

              <li>
                <a href="#" className="social-link">
                  <ion-icon name="logo-facebook"></ion-icon>
                </a>
              </li>

              <li>
                <a href="#" className="social-link">
                  <ion-icon name="logo-instagram"></ion-icon>
                </a>
              </li>

              <li>
                <a href="#" className="social-link">
                  <ion-icon name="logo-youtube"></ion-icon>
                </a>
              </li>
            </ul>
          </div>

          {/* <a href="#" className="logo">
            <img src="./assets/images/logo.png" width="179" height="26" loading="lazy" alt="Glowing" />
          </a>

          <img src="./assets/images/pay.png" width="313" height="28" alt="available all payment method" className="w-100" /> */}

        </div>

      </div>
    </footer>
  );
};

export default Footer;
