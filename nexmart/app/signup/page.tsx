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

                <div className="formTitle">
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

                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="Enter your password"
                    />

                    <div className="passwordTop">
                        <label>Password</label>
                        <a href="#">Forgot password?</a>
                    </div>
                    
                </form>
            </div>
        </div>
    )
}