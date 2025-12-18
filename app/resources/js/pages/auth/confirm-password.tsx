import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/password/confirm';
import { Form, Head } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';

export default function ConfirmPassword() {
    return (
        <>
            <Head title="Confirm password" />

            {/* Dark Background with subtle gradient */}
            <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                {/* Subtle animated overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-950/20 via-slate-900/20 to-slate-950/20 animate-gradient"></div>

                {/* Subtle decorative elements */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-slate-800/10 rounded-full blur-3xl"></div>

                {/* Confirm Password Card */}
                <div className="relative z-10 w-full max-w-md px-6">
                    {/* Card with subtle border */}
                    <div className="backdrop-blur-xl bg-slate-800/50 border border-slate-700/50 rounded-2xl shadow-2xl p-8">
                        {/* Logo and Title */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-700/50 border border-slate-600/50 rounded-2xl mb-4 shadow-lg">
                                <ShieldCheck className="w-8 h-8 text-blue-400" />
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-2">
                                Confirm Password
                            </h1>
                            <p className="text-slate-400 text-sm">
                                This is a secure area. Please confirm your password to continue.
                            </p>
                        </div>

                        {/* Confirm Password Form */}
                        <Form {...store.form()} resetOnSuccess={['password']} className="space-y-5">
                            {({ processing, errors }) => (
                                <>
                                    {/* Password Field */}
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-slate-200 font-medium">
                                            Password
                                        </Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            name="password"
                                            placeholder="••••••••"
                                            autoComplete="current-password"
                                            autoFocus
                                            className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:bg-slate-900/70 focus:border-blue-500 transition-all"
                                        />
                                        <InputError message={errors.password} className="text-red-400" />
                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                                        disabled={processing}
                                        data-test="confirm-password-button"
                                    >
                                        {processing && <Spinner className="mr-2" />}
                                        Confirm password
                                    </Button>
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
