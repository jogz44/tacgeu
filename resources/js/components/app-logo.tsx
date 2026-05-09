import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md bg-transparent">
                <AppLogoIcon className="size-8 fill-current text-black dark:text-white" />
            </div>
            <div className="ml-1 flex grid flex-1 items-center justify-center text-left text-sm">
                <span className="mb-0.5 text-center leading-none font-semibold break-words">Tagum City Government Employees' Union</span>
            </div>
        </>
    );
}
