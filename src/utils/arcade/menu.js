/** ask the mobile menu (SiteNav) to close */
export const closeMenu = () => document.dispatchEvent(new CustomEvent('procom:closemenu'));

/** ask the layout to open the site's contact dialog */
export const openContact = () => document.dispatchEvent(new CustomEvent('procom:contact'));
