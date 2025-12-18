import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { logout } from '@/routes';
import { send } from '@/routes/verification';
import { Form, Head } from '@inertiajs/react';
import { Mail } from 'lucide-react';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <>
            <Head title="Email verification" />

            {/* Dark Background with subtle gradient */}
            <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                {/* Subtle animated overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-950/20 via-slate-900/20 to-slate-950/20 animate-gradient"></div>

                {/* Subtle decorative elements */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-slate-800/10 rounded-full blur-3xl"></div>

                {/* Verify Email Card */}
                <div className="relative z-10 w-full max-w-md px-6">
                    {/* Card with subtle border */}
                    <div className="backdrop-blur-xl bg-slate-800/50 border border-slate-700/50 rounded-2xl shadow-2xl p-8">
                        {/* Logo and Title */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-700/50 border border-slate-600/50 rounded-2xl mb-4 shadow-lg">
                                <Mail className="w-8 h-8 text-blue-400" />
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-2">
                                Verify Email
                            </h1>
                            <p className="text-slate-400 text-sm">
                                Please verify your email address by clicking on the link we just emailed to you
                            </p>
                        </div>

                        {/* Status Message */}
                        {status === 'verification-link-sent' && (
                            <div className="mb-6 p-3 bg-green-900/30 border border-green-700/30 rounded-lg text-center text-sm font-medium text-green-300">
                                A new verification link has been sent to the email address you provided during registration.
                            </div>
                        )}

                        {/* Verify Email Form */}
                        <Form {...send.form()} className="space-y-5 text-center">
                            {({ processing }) => (
                                <>
                                    {/* Resend Button */}
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        variant="secondary"
                                        className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                                    >
                                        {processing && <Spinner className="mr-2" />}
                                        Resend verification email
                                    </Button>

                                    {/* Logout Link */}
                                    <div className="pt-4 border-t border-slate-700/50">
                                        <TextLink
                                            href={logout()}
                                            className="text-slate-400 hover:text-slate-300 text-sm transition-colors"
                                        >
                                            Log out
                                        </TextLink>
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
