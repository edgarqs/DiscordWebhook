import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { Webhook } from 'lucide-react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: LoginProps) {
    return (
        <>
            <Head title="Log in" />

            {/* Dark Background with subtle gradient */}
            <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                {/* Subtle animated overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-950/20 via-slate-900/20 to-slate-950/20 animate-gradient"></div>

                {/* Subtle decorative elements */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-slate-800/10 rounded-full blur-3xl"></div>

                {/* Login Card */}
                <div className="relative z-10 w-full max-w-md px-6">
                    {/* Card with subtle border */}
                    <div className="backdrop-blur-xl bg-slate-800/50 border border-slate-700/50 rounded-2xl shadow-2xl p-8">
                        {/* Logo and Title */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-700/50 border border-slate-600/50 rounded-2xl mb-4 shadow-lg">
                                <Webhook className="w-8 h-8 text-blue-400" />
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-2">
                                Welcome Back
                            </h1>
                            <p className="text-slate-400 text-sm">
                                Log in to manage your Discord webhooks
                            </p>
                        </div>

                        {/* Status Message */}
                        {status && (
                            <div className="mb-6 p-3 bg-green-900/30 border border-green-700/30 rounded-lg text-center text-sm font-medium text-green-300">
                                {status}
                            </div>
                        )}

                        {/* Login Form */}
                        <Form
                            {...store.form()}
                            resetOnSuccess={['password']}
                            className="space-y-5"
                        >
                            {({ processing, errors }) => (
                                <>
                                    {/* Email Field */}
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-slate-200 font-medium">
                                            Email address
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="email"
                                            placeholder="email@example.com"
                                            className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:bg-slate-900/70 focus:border-blue-500 transition-all"
                                        />
                                        <InputError message={errors.email} className="text-red-400" />
                                    </div>

                                    {/* Password Field */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password" className="text-slate-200 font-medium">
                                                Password
                                            </Label>
                                            {canResetPassword && (
                                                <TextLink
                                                    href={request()}
                                                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                                    tabIndex={5}
                                                >
                                                    Forgot password?
                                                </TextLink>
                                            )}
                                        </div>
                                        <Input
                                            id="password"
                                            type="password"
                                            name="password"
                                            required
                                            tabIndex={2}
                                            autoComplete="current-password"
                                            placeholder="••••••••"
                                            className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:bg-slate-900/70 focus:border-blue-500 transition-all"
                                        />
                                        <InputError message={errors.password} className="text-red-400" />
                                    </div>

                                    {/* Remember Me */}
                                    <div className="flex items-center space-x-3">
                                        <Checkbox
                                            id="remember"
                                            name="remember"
                                            tabIndex={3}
                                            className="border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                        />
                                        <Label htmlFor="remember" className="text-slate-300 font-normal cursor-pointer">
                                            Remember me
                                        </Label>
                                    </div>

                                    {/* Login Button */}
                                    <Button
                                        type="submit"
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                                        tabIndex={4}
                                        disabled={processing}
                                        data-test="login-button"
                                    >
                                        {processing && <Spinner className="mr-2" />}
                                        Log in
                                    </Button>

                                    {/* Sign Up Link */}
                                    {canRegister && (
                                        <div className="text-center pt-4 border-t border-slate-700/50">
                                            <p className="text-slate-400 text-sm">
                                                Don't have an account?{' '}
                                                <TextLink
                                                    href={register()}
                                                    tabIndex={5}
                                                    className="text-blue-400 font-semibold hover:text-blue-300 transition-colors"
                                                >
                                                    Sign up
                                                </TextLink>
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </Form>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-slate-500 text-sm mt-6">
                        © {new Date().getFullYear()} Discord Webhook Manager. All rights reserved.
                    </p>
                </div>
            </div>

            {/* Custom animations */}
            <style>{`
                @keyframes gradient {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.8; }
                }
                .animate-gradient {
                    animation: gradient 8s ease-in-out infinite;
                }
            `}</style>
        </>
    );
}
