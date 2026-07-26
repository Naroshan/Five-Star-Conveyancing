import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const STROKE = 1.8;
function Svg({ size = 24, children }) {
    return (_jsx("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: children }));
}
export function ShieldCheckIcon({ size, color = 'currentColor' }) {
    return (_jsxs(Svg, { size: size, children: [_jsx("path", { d: "M12 3.5 5 6v5.2c0 4.4 2.9 7.6 7 8.8 4.1-1.2 7-4.4 7-8.8V6l-7-2.5Z", stroke: color, strokeWidth: STROKE, strokeLinejoin: "round" }), _jsx("path", { d: "M9 12.2 11.2 14.4 15.4 10", stroke: color, strokeWidth: STROKE, strokeLinecap: "round", strokeLinejoin: "round" })] }));
}
export function StarIcon({ size, color = 'currentColor' }) {
    return (_jsx(Svg, { size: size, children: _jsx("path", { d: "M12 3.8 14.3 9 20 9.7 15.8 13.5 17 19.2 12 16.3 7 19.2 8.2 13.5 4 9.7 9.7 9 12 3.8Z", fill: color, stroke: color, strokeWidth: 1, strokeLinejoin: "round" }) }));
}
export function MailIcon({ size, color = 'currentColor' }) {
    return (_jsxs(Svg, { size: size, children: [_jsx("rect", { x: 4, y: 5.5, width: 16, height: 13, rx: 2, stroke: color, strokeWidth: STROKE }), _jsx("path", { d: "M4.5 6.5 12 12.5l7.5-6", stroke: color, strokeWidth: STROKE, strokeLinecap: "round", strokeLinejoin: "round" })] }));
}
export function BookmarkIcon({ size, color = 'currentColor' }) {
    return (_jsx(Svg, { size: size, children: _jsx("path", { d: "M6.5 4h11v16l-5.5-3.6L6.5 20V4Z", stroke: color, strokeWidth: STROKE, strokeLinejoin: "round" }) }));
}
export function PhoneIcon({ size, color = 'currentColor' }) {
    return (_jsx(Svg, { size: size, children: _jsx("path", { d: "M7 3.8 4.6 6.2c-.6 3.6 4.6 8.8 8.2 9.2 0 0 3.6-2.4 3.6-2.4l3.6 2.4c0 3-1.5 4.4-3.6 4.4C10.6 19.8 4.2 13.4 4.2 7.6c0-2.1 1.4-3.6 4.4-3.6l2.4 3.6-3.4 3.4", stroke: color, strokeWidth: STROKE, strokeLinecap: "round", strokeLinejoin: "round" }) }));
}
export function RibbonBadgeIcon({ size, color = 'currentColor' }) {
    return (_jsxs(Svg, { size: size, children: [_jsx("circle", { cx: 12, cy: 9, r: 5.5, stroke: color, strokeWidth: STROKE }), _jsx("path", { d: "M9 13.5 7.5 20l4.5-2.5 4.5 2.5-1.5-6.5", stroke: color, strokeWidth: STROKE, strokeLinecap: "round", strokeLinejoin: "round" }), _jsx("path", { d: "M9.7 9 11.2 10.5 14.5 7.2", stroke: color, strokeWidth: STROKE, strokeLinecap: "round", strokeLinejoin: "round" })] }));
}
