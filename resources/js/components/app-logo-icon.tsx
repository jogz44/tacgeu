import { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            {...props}
            src={`${window.APP_BASE_URL}assets/icon/app-logo.svg`}
            alt="Tagum City Government Employees' Union"
        />
    );
}
