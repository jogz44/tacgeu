<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 - Page Not Found</title>
    @vite('resources/css/app.css')
</head>

<body class="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center h-screen">
    <div
        class="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-10 text-center max-w-md w-full transform transition-all duration-500 hover:scale-105 hover:shadow-3xl">
        
        <!-- Animated Icon -->
        <div class="flex justify-center mb-6">
            <svg class="w-20 h-20 text-blue-600 animate-pulse" fill="none" stroke="currentColor" stroke-width="2"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round"
                    d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 14h.01M12 8v4" />
            </svg>
        </div>

        <!-- Title -->
        <h1 class="text-6xl font-extrabold text-blue-600 mb-3 animate-bounce">404</h1>
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Page Not Found</h2>

        <!-- Message -->
        <p class="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            Hmm... looks like the page you’re looking for doesn’t exist. <br>
            It might have been moved, deleted, or never created.
        </p>

        <!-- Button -->
        <a href="{{ route('home') }}"
            class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 focus:ring-4 focus:ring-blue-300">
            🏠 Return to Home
        </a>

        <!-- Footer Note -->
        <p class="text-xs text-gray-400 dark:text-gray-500 mt-6">
            Error code: 404 • Page Not Found
        </p>
    </div>
</body>

</html>
