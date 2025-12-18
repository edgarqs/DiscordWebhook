import { login } from '@/routes';
import { store } from '@/routes/register';
import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { UserPlus } from 'lucide-react';

export default function Register() {
    return (
        <>
            <Head title="Register" />

            {/* Dark Background with subtle gradient */}
            <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                {/* Subtle animated overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-950/20 via-slate-900/20 to-slate-950/20 animate-gradient"></div>

                {/* Subtle decorative elements */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-slate-800/10 rounded-full blur-3xl"></div>

                {/* Register Card */}
                <div className="relative z-10 w-full max-w-md px-6">
                    {/* Card with subtle border */}
                    <div className="backdrop-blur-xl bg-slate-800/50 border border-slate-700/50 rounded-2xl shadow-2xl p-8">
                        {/* Logo and Title */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-700/50 border border-slate-600/50 rounded-2xl mb-4 shadow-lg">
                                <UserPlus className="w-8 h-8 text-blue-400" />
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-2">
                                Create Account
                            </h1>
                            <p className="text-slate-400 text-sm">
                                Enter your details to get started
                            </p>
                        </div>

                        {/* Register Form */}
                        <Form
                            {...store.form()}
                            resetOnSuccess={['password', 'password_confirmation']}
                            disableWhileProcessing
                            className="space-y-5"
                        >
                            {({ processing, errors }) => (
                                <>
                                    {/* Name Field */}
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-slate-200 font-medium">
                                            Name
                                        </Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            name="name"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="name"
                                            placeholder="Full name"
                                            className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:bg-slate-900/70 focus:border-blue-500 transition-all"
                                        />
                                        <InputError message={errors.name} className="text-red-400" />
                                    </div>

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
                                            tabIndex={2}
                                            autoComplete="email"
                                            placeholder="email@example.com"
                                            className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:bg-slate-900/70 focus:border-blue-500 transition-all"
                                        />
                                        <InputError message={errors.email} className="text-red-400" />
                                    </div>

                                    {/* Password Field */}
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-slate-200 font-medium">
                                            Password
                                        </Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            name="password"
                                            required
                                            tabIndex={3}
                                            autoComplete="new-password"
                                            placeholder="••••••••"
                                            className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:bg-slate-900/70 focus:border-blue-500 transition-all"
                                        />
                                        <InputError message={errors.password} className="text-red-400" />
                                    </div>

                                    {/* Confirm Password Field */}
                                    <div className="space-y-2">
                                        <Label htmlFor="password_confirmation" className="text-slate-200 font-medium">
                                            Confirm password
                                        </Label>
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            name="password_confirmation"
                                            required
                                            tabIndex={4}
                                            autoComplete="new-password"
                                            placeholder="••••••••"
                                            className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:bg-slate-900/70 focus:border-blue-500 transition-all"
                                        />
                                        <InputError message={errors.password_confirmation} className="text-red-400" />
                                    </div>

                                    {/* Register Button */}
                                    <Button
                                        type="submit"
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                                        tabIndex={5}
                                        data-test="register-user-button"
                                    >
                                        {processing && <Spinner className="mr-2" />}
                                        Create account
                                    </Button>

                                    {/* Login Link */}
                                    <div className="text-center pt-4 border-t border-slate-700/50">
                                        <p className="text-slate-400 text-sm">
                                            Already have an account?{' '}
                                            <TextLink
                                                href={login()}
                                                tabIndex={6}
                                                className="text-blue-400 font-semibold hover:text-blue-300 transition-colors"
                                            >
                                                Log in
                                            </TextLink>
                                        </p>
                                    </div>
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
