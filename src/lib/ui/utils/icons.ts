// Path data (24x24, stroke) for <Icon name="...">
export const ICONS: Record<string, string> = {
    check: 'M5 12.5l4.5 4.5L19 7.5', 'chevron-down': 'M6 9l6 6 6-6', 'chevron-right': 'M9 6l6 6-6 6', 'chevron-left': 'M15 6l-6 6 6 6',
    x: 'M6 6l12 12M18 6L6 18', search: 'M11 5a6 6 0 100 12 6 6 0 000-12zM20 20l-4.2-4.2', plus: 'M12 5v14M5 12h14', minus: 'M5 12h14',
    'arrow-right': 'M5 12h14M13 6l6 6-6 6', info: 'M12 3a9 9 0 100 18 9 9 0 000-18zM12 11v5M12 8v.01', download: 'M12 4v11M7 11l5 5 5-5M5 20h14',
    'chevron-up': 'M6 15l6-6 6 6', menu: 'M4 7h16M4 12h16M4 17h16', 'more-horizontal': 'M5 11.2a.8.8 0 100 1.6.8.8 0 000-1.6zM12 11.2a.8.8 0 100 1.6.8.8 0 000-1.6zM19 11.2a.8.8 0 100 1.6.8.8 0 000-1.6z',
    star: 'M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9l-5.2 2.8 1-5.9L3.5 9.7l5.9-.8z', calendar: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4', clock: 'M12 3a9 9 0 100 18 9 9 0 000-18zM12 7v5l3 2',
    home: 'M4 11l8-7 8 7M6 10v10h12V10', settings: 'M4 7h10M18 7h2M4 17h2M10 17h10M14 5v4M6 15v4', bell: 'M6 17v-6a6 6 0 1112 0v6l1.5 2h-15zM10 21h4', user: 'M12 4a4 4 0 100 8 4 4 0 000-8zM4 20a8 8 0 0116 0',
    folder: 'M3 6h6l2 2h10v11H3z', file: 'M6 3h8l5 5v13H6zM14 3v5h5', command: 'M9 9V6a3 3 0 10-3 3h12a3 3 0 10-3-3v12a3 3 0 103-3H6a3 3 0 103 3z', 'panel-left': 'M4 5h16v14H4zM9 5v14',
    trash: 'M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13', edit: 'M4 20h4L19 9l-4-4L4 16zM13 7l4 4', copy: 'M8 8h11v12H8zM5 16V4h11', alert: 'M12 4l9 16H3zM12 10v4M12 17v.01',
    'circle-check': 'M12 3a9 9 0 100 18 9 9 0 000-18zM8 12.5l3 3 5-6', filter: 'M4 5h16l-6 7v6l-4 2v-8z', share: 'M12 15V4M8 8l4-4 4 4M5 13v7h14v-7', bolt: 'M13 3L5 13h6l-1 8 8-10h-6z',
    external: 'M14 4h6v6M20 4l-9 9M18 14v6H4V6h6', upload: 'M12 16V4M7 9l5-5 5 5M4 20h16', image: 'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M9 9.5v.01', pin: 'M12 21s6-5.6 6-11a6 6 0 10-12 0c0 5.4 6 11 6 11zM12 12a2 2 0 100-4 2 2 0 000 4z', list: 'M9 6h11M9 12h11M9 18h11M4 6v.01M4 12v.01M4 18v.01', grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z', bold: 'M7 5h6a3.5 3.5 0 010 7H7zM7 12h7a3.5 3.5 0 010 7H7z', italic: 'M10 5h8M6 19h8M14 5l-4 14', link: 'M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1', 'align-left': 'M4 6h16M4 10h10M4 14h16M4 18h10', undo: 'M9 14L4 9l5-5M4 9h10a6 6 0 010 12h-3', 'chevrons-right': 'M7 6l6 6-6 6M13 6l6 6-6 6', maximize: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5', 'folder-open': 'M3 7h6l2 2h10l-2 10H3z', layers: 'M12 4l9 5-9 5-9-5zM3 14l9 5 9-5', 'arrow-up': 'M12 19V5M6 11l6-6 6 6'
};

Object.assign(ICONS, {
    'log-out': 'M10 4H5v16h5M15 8l4 4-4 4M19 12H9',
    globe: 'M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18',
    'help-circle': 'M12 3a9 9 0 100 18 9 9 0 000-18zM9.5 9.5a2.5 2.5 0 114 2c-1 .7-1.5 1-1.5 2M12 17v.01',
    message: 'M4 5h16v11H9l-5 4z',
    key: 'M8 14a4 4 0 110-8 4 4 0 010 8zM11 11l9 9M17 17l2-2'
});
