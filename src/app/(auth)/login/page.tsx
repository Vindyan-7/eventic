import { LoginForm } from "@/components/forms/login-form";

export default function LoginPage() {
    return (
        <div className="max-w-md mx-auto py-10">
            <h1 className="text-3xl font-bold mb-8">
                Login
            </h1>

            <LoginForm />
        </div>
    );
}