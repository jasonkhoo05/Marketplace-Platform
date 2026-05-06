import "./signup.css";
import { TbBrandAppgallery } from "react-icons/tb";

export default function SignupPage() {
    return (
        <div className="signup-container">

            <div className="leftPanel">
                
                <div className="logo">
                    <TbBrandAppgallery className="logoIcon" />
                    <span>NexMart</span>
                </div>

                 <div className="content-left">
                    <p className="welcome">WELCOME BACK</p>

                    <h1>
                        <span className="line1">Shop smarter.</span>
                        <br />
                        <span className="line2">Live better.</span>
                    </h1>

                    <p className="description">
                        Join thousands of happy shoppers who 
                        trust NexMart for their everyday needs 
                        - from daily essentials to weekend finds.
                    </p>
                 </div>
            </div>

            <div className="rightPanel">
                <div className="formBox">
                    <h2> Sign up your account</h2>
                

                    <p className="subtitle">
                        Good to have your back. Pick up right where you left off.
                    </p>

                    <form>
                        <label>Email address</label>
                        <input
                            type="email"
                            placeholder="you@gmail.com"
                        />

                        <div className="passwordTop">
                            <label>Password</label>
                            <a href="#">Forgot password?</a>
                        </div>

                        <input
                            type="password"
                            placeholder="Enter your password"
                        />

                        <button type="submit" className="signupButton">
                            Sign up
                        </button>
                    </form>
                    <p className="loginText">
                        Already have an account?
                        <a href="/login"> Login</a>
                    </p>
                </div>
            </div>
        </div>
    )
}