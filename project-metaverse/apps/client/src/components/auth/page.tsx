import React from 'react';
import { Globe2, LockKeyhole, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BACKEND_URL } from '@/lib/config';

export function AuthPage({ signup }: { signup?: boolean }) {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (signup) {
      if (username && password) {
        const signupData = await fetch(`${BACKEND_URL}/signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password, type: 'admin' })
        });

        if (signupData.status == 200) {
          alert("Signup Successful");
        }
      }
    } else {
      if (username && password) {
        const loginData = await fetch(`${BACKEND_URL}/signin`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        });

        const data = await loginData.json();
        console.log(data);
        if (data.token) {
          localStorage.setItem("token", data.token);
          window.location.href = "/";
        }
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Globe2 className="h-10 w-10 text-indigo-600" />
            <span className="text-3xl font-bold text-gray-900">VirtualMeet</span>
          </div>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
            <LockKeyhole className="h-8 w-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome {signup ? "Back" : ""}
          </h1>
          <p className="text-gray-600">
            {signup ? "Create your account to get started" : "Sign in to your account"}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  required
                  placeholder="Enter your username"
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="Enter your password"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                onClick={(e) => {
                  setLoading(true);
                  handleSubmit(e);
                  setLoading(false);
                }}
                className="w-full h-12"
              >
                {loading ? (
                  <span className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </span>
                ) : (
                  signup ? "Create Account" : "Sign In"
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {signup ? "Already have an account?" : "Don't have an account?"}{" "}
              <a
                href={signup ? "/login" : "/signup"}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                {signup ? "Sign In" : "Create Account"}
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center mt-8 text-gray-500 text-sm">
          By continuing, you agree to VirtualMeet's{" "}
          <a href="#" className="text-indigo-600 hover:text-indigo-700">Terms of Service</a>{" "}
          and{" "}
          <a href="#" className="text-indigo-600 hover:text-indigo-700">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}