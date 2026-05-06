import "./signup.css";

export default function SignupPage() {
    return (
        <div className="signup-container">

            <div className="leftPanel">
                <div className="logo">NexMart</div>

                 <div className="content-left">
                    <p className="welcome">WELCOME BACK</p>

                    <h1>
                        Shop smarter.
                        <br />
                        Live better.
                    </h1>

                    <p className="description">
                        Join thousands of happy shoppers who trust NexMart for their everyday
                        needs - from daily essentials to weekend finds
                    </p>
                 </div>
            </div>

            <div className="rightPanel">

                <div className="formBox">
                    <h2> Sign up your account</h2>
                </div>

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
                    <a href="#">Sign in</a>
                </p>
            </div>
        </div>
    )
}