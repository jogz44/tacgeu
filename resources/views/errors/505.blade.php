<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>505 - Server Error</title>
    @vite('resources/css/app.css')
</head>

<body
    class="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center h-screen">
    <div
        class="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-10 text-center max-w-md w-full transform transition-all duration-500 hover:scale-105 hover:shadow-3xl">

        <!-- Animated Icon -->
        <div class="flex justify-center mb-6">
            <svg class="w-20 h-20 text-red-600 animate-pulse" fill="none" stroke="currentColor" stroke-width="2"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round"
                    d="M12 9v4m0 4h.01M4.93 4.93l14.14 14.14M12 2a10 10 0 100 20 10 10 0 000-20z" />
            </svg>
        </div>

        <!-- Title -->
        <h1 class="text-6xl font-extrabold text-red-600 mb-3 animate-bounce">500</h1>
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Internal Server Error</h2>

        <!-- Message -->
        <p class="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            Oops! Something went wrong on our end. <br>
            Don’t worry, our team has been notified and we’re working to fix it.
        </p>

        <!-- Button -->
        <a href="{{ route('home') }}"
            class="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 focus:ring-4 focus:ring-red-300">
            🔄 Return to Home
        </a>

        <!-- Footer Note -->
        <p class="text-xs text-gray-400 dark:text-gray-500 mt-6">
            Error code: 500 • Internal Server Error
        </p>
    </div>
</body>

</html>