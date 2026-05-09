import ProfileLayout from '@/layouts/profile-layout'
import { Head, Link } from '@inertiajs/react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, UserCog, ArrowRight } from 'lucide-react'
import { useState } from 'react'

export default function RegisterSelection() {
    const [selectedType, setSelectedType] = useState<'member' | 'officer' | null>(null)

    return (
        <ProfileLayout
            title="Select Your Registration Type"
            description="Join the Tagum City Government Employees' Union (TACGEU) — choose your role to continue."
        >
            <Head title="Registration Type" />

            <div className="mt-10 grid gap-8 sm:grid-cols-2">
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
                        <Button
                            variant={selectedType === 'member' ? 'default' : 'outline'}
                            asChild
                            className="w-full flex items-center justify-center gap-2 group-hover:gap-3 transition-all duration-200"
                        >
                            <Link href={route('membership.member', { type: 'member' })}>
                                Register as Member
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>

                {/* Officer Card */}
                <Card
                    onClick={() => setSelectedType('officer')}
                    className={`group relative cursor-pointer overflow-hidden border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                        selectedType === 'officer'
                            ? 'border-green-600 bg-green-50 dark:border-green-500 dark:bg-green-950/40'
                            : 'border-gray-200 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-600'
                    }`}
                >
                    {/* Animated background accent */}
                    <div
                        className={`absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-10 ${
                            selectedType === 'officer' ? 'bg-green-600' : 'bg-green-400'
                        }`}
                    />

                    <CardHeader className="relative text-center">
                        <CardTitle className="flex flex-col items-center gap-3">
                            <UserCog
                                className={`h-12 w-12 transition-transform duration-300 ${
                                    selectedType === 'officer'
                                        ? 'text-green-700 dark:text-green-400 scale-110'
                                        : 'text-green-600 group-hover:scale-110'
                                }`}
                            />
                            <span className="text-xl font-semibold">Officer Registration</span>
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="relative text-center text-sm text-gray-700 dark:text-gray-300">
                        Enroll as a <strong>TACGEU officer</strong> to help manage members, oversee events,
                        and maintain the organization’s administrative systems.
                    </CardContent>

                    <CardFooter className="relative justify-center">
                        <Button
                            variant={selectedType === 'officer' ? 'default' : 'outline'}
                            asChild
                            className="w-full flex items-center justify-center gap-2 group-hover:gap-3 transition-all duration-200"
                        >
                            <Link href={route('membership.officer', { type: 'officer' })}>
                                Register as Officer
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
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
