<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>403 - Forbidden</title>
    @vite('resources/css/app.css')
</head>

<body
    class="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center h-screen">
    <div
        class="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-10 text-center max-w-md w-full transform transition-all duration-500 hover:scale-105 hover:shadow-3xl">
        <!-- Animated Shield Icon -->
        <div class="flex justify-center mb-6">
            <svg class="w-20 h-20 text-red-600 animate-pulse" fill="none" stroke="currentColor" stroke-width="2"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 22s8-4 8-10V6l-8-4-8 4v6c0 6 8 10 8 10z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 10l6 6m0-6l-6 6" />
            </svg>
        </div>

        <!-- Main Text -->
        <h1 class="text-6xl font-extrabold text-red-600 mb-3 animate-bounce">403</h1>
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Access Denied</h2>

        <p class="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            Oops! It seems you don’t have permission to view this page.
            <br>
            Maybe you took a wrong turn — let's get you back on track.
        </p>

        <!-- Action Button -->
        <a href="{{ route('home') }}"
            class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 focus:ring-4 focus:ring-blue-300">
            ⬅ Return to Home
        </a>

        <!-- Optional Subtext -->
        <p class="text-xs text-gray-400 dark:text-gray-500 mt-6">
            Error code: 403 • Forbidden Access
        </p>
    </div>
</body>

</html>