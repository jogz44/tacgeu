<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>500 - Server Error</title>
    @vite('resources/css/app.css')
</head>

<body class="bg-gray-100 dark:bg-gray-900 flex items-center justify-center h-screen">
    <div
        class="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-10 text-center max-w-md transform transition duration-500 hover:scale-105 hover:shadow-3xl">
        <h1 class="text-6xl font-extrabold text-red-600 mb-4 animate-bounce">500</h1>
        <p class="text-lg text-gray-700 dark:text-gray-300 mb-4">
            Oops! Something went wrong on our end.
        </p>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-8">
            Our team has been notified and is working to fix it. Please try again later.
        </p>

        <div class="flex justify-center">
            <a href="{{ route('home') }}"
                class="px-6 py-3 bg-red-600 text-white font-medium rounded-full shadow-md hover:bg-red-700 transition-all duration-300">
                ⬅️ Return to Home
            </a>
        </div>

        <div class="mt-6 text-xs text-gray-400 dark:text-gray-500">
            <p>Need help? Contact <a href="mailto:support@example.com"
                    class="text-red-600 dark:text-red-400 hover:underline">support</a>.</p>
        </div>

        <div class="mt-8 animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                stroke-width="1.5" stroke="currentColor"
                class="w-12 h-12 mx-auto text-red-500 opacity-80">
                <path stroke-linecap="round" stroke-linejoin="round"
                    d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
    </div>
</body>

</html>
