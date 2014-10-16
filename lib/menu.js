/**
 * @ignore
 * menu
 * @author yiminghe@gmail.com
 */

var Menu = require('./menu/control');

Menu.Item = require('./menu/menuitem');
Menu.CheckItem = require('./menu/check-menuitem');
Menu.RadioItem = require('./menu/radio-menuitem');
Menu.SubMenu = require('./menu/submenu');
Menu.PopupMenu = require('./menu/popupmenu');

module.exports = Menu;
Menu.version = '@VERSION@';
