import ProfileLayout from '@/layouts/profile-layout'
import { Head, router } from '@inertiajs/react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Users, ArrowRight, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Link } from '@inertiajs/react'

export default function RegisterSelection() {
    const [selectedType, setSelectedType] = useState<'member' | 'officer' | null>(null)
    const [privacyOpen, setPrivacyOpen] = useState(false)

    const proceedToMemberRegistration = () => {
        setPrivacyOpen(false)
        router.visit(route('membership.member', { type: 'member' }))
    }

    return (
        <ProfileLayout
            title="Select Your Registration Type"
            description="Join the Tagum City Government Employees' Union (TACGEU) — choose your role to continue."
        >
            <Head title="Registration Type" />

            <div className="mt-10 grid gap-8 sm:grid-cols-1">
                {/* Member Card */}
                <Card
                    onClick={() => setSelectedType('member')}
                    className={`group relative cursor-pointer overflow-hidden border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                        selectedType === 'member'
                            ? 'border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/40'
                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600'
                    }`}
                >
                    {/* Animated background accent */}
                    <div
                        className={`absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-10 ${
                            selectedType === 'member' ? 'bg-blue-600' : 'bg-blue-400'
                        }`}
                    />

                    <CardHeader className="relative text-center">
                        <CardTitle className="flex flex-col items-center gap-3">
                            <Users
                                className={`h-12 w-12 transition-transform duration-300 ${
                                    selectedType === 'member'
                                        ? 'text-blue-700 dark:text-blue-400 scale-110'
                                        : 'text-blue-600 group-hover:scale-110'
                                }`}
                            />
                            <span className="text-xl font-semibold">Member Registration</span>
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="relative text-center text-sm text-gray-700 dark:text-gray-300">
                        Become a <strong>member</strong> of TACGEU to enjoy exclusive access to union announcements,
                        activities, and benefits.
                    </CardContent>

                    <CardFooter className="relative justify-center">
                        <AlertDialog open={privacyOpen} onOpenChange={setPrivacyOpen}>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant={selectedType === 'member' ? 'default' : 'outline'}
                                    onClick={(e) => {
                                        // prevent the parent Card's onClick from double-firing selection logic oddly
                                        e.stopPropagation()
                                        setSelectedType('member')
                                        setPrivacyOpen(true)
                                    }}
                                    className="w-full flex items-center justify-center gap-2 group-hover:gap-3 transition-all duration-200"
                                >
                                    Register as Member
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </AlertDialogTrigger>

                            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center gap-2">
                                        <ShieldCheck className="h-5 w-5 text-blue-600" />
                                        Data Privacy Notice
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-left space-y-2">
                                        <span className="block">
                                            By continuing, you agree that the personal information you provide
                                            (e.g. name, employee details, contact information) will be collected
                                            and processed by TACGEU solely for membership registration, records
                                            management, and union-related communications.
                                        </span>
                                        <span className="block">
                                            Your data will be handled in accordance with the Data Privacy Act of
                                            2012 (RA 10173) and will not be shared with third parties without your
                                            consent, except as required by law.
                                        </span>
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={proceedToMemberRegistration}>
                                        I Agree & Continue
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardFooter>
                </Card>
            </div>

            {/* Back to Login */}
            <div className="mt-10 text-center text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link
                    href={route('login')}
                    className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                    Log in here
                </Link>
            </div>
        </ProfileLayout>
    )
}
