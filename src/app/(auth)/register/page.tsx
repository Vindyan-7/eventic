import { RegisterForm } from "@/components/forms/register-form";

export default function RegisterPage() {
    return (
        <div className="max-w-md mx-auto py-10">
            <h1 className="text-3xl font-bold mb-8">
                Create Account
            </h1>

            <RegisterForm />
        </div>
    );
}