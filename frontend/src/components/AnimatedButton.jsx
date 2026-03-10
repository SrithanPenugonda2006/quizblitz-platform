import { Link } from 'react-router-dom';

export default function AnimatedButton({
    children,
    onClick,
    className = '',
    type = 'button',
    disabled = false,
    to,
    fullWidth = false,
    variant = 'primary'
}) {
    const Component = to ? Link : 'button';

    let variantClass = 'btn-lime';
    if (variant === 'secondary') variantClass = 'btn-ghost';
    if (variant === 'danger') variantClass = 'btn-danger';

    const baseClass = `btn ${variantClass} ${fullWidth ? 'w-full' : ''} ${className}`;

    const props = to
        ? { to, className: baseClass, onClick }
        : { type, onClick, disabled, className: baseClass };

    return (
        <Component {...props}>
            {children}
        </Component>
    );
}
