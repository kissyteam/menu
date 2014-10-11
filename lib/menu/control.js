/**
 * @ignore
 * menu control for kissy,accommodate menu items
 * @author yiminghe@gmail.com
 */
var util = require('util');
var Container = require('component/container');
var DelegateChildrenExtension = require('component/extension/delegate-children');
var KeyCode = require('node').Event.KeyCode;

/**
 * KISSY Menu.
 * xclass: 'menu'.
 * @class KISSY.Menu
 * @extends KISSY.Component.Container
 */
module.exports = Container.extend([
    DelegateChildrenExtension
], {
    isMenu: 1,

    beforeCreateDom: function (renderData) {
        renderData.elAttrs.role = 'menu';
    },

    bindUI: function () {
        var self = this;
        self.on('afterHighlightedItemChange', afterHighlightedItemChange, self);
    },

    // 只能允许一个方向，这个属性只是为了记录和排他性选择
    // 只允许调用 menuItem 的 set('highlighted')
    // 不允许调用 menu 的 set('highlightedItem')，内部调用时防止循环更新
    _onSetHighlightedItem: function (v, ev) {
        var highlightedItem;
        // ignore v == null
        // do not use set('highlightedItem',null) for api
        // use this.get('highlightedItem').set('highlighted', false);
        if (v && ev && (highlightedItem = ev.prevVal)) {
            // in case set highlightedItem null again
            highlightedItem.set('highlighted', false, {
                data: {
                    byPassSetHighlightedItem: 1
                }
            });
        }
    },

    _onSetVisible: function (v, e) {
        var self = this;
        self.callSuper(v, e);
        var highlightedItem;
        if (!v && (highlightedItem = self.get('highlightedItem'))) {
            highlightedItem.set('highlighted', false);
        }
    },

    getRootMenu: function () {
        return this;
    },

    handleMouseEnterInternal: function (e) {
        var self = this;
        self.callSuper(e);
        var rootMenu = self.getRootMenu();
        // maybe called by popupmenu, no submenu
        if (rootMenu !== self && rootMenu._popupAutoHideTimer) {
            clearTimeout(rootMenu._popupAutoHideTimer);
            rootMenu._popupAutoHideTimer = null;
        }
    },

    handleBlurInternal: function (e) {
        var self = this;
        self.callSuper(e);
        var highlightedItem;
        if ((highlightedItem = self.get('highlightedItem'))) {
            highlightedItem.set('highlighted', false);
        }
    },

    //dir : -1 ,+1
    //skip disabled items
    _getNextEnabledHighlighted: function (index, dir) {
        var children = this.get('children');
        var len = children.length;
        var cur = index;
        do {
            var c = children[cur];
            if (!c.get('disabled') && (c.get('visible') !== false)) {
                return children[cur];
            }
            cur = (cur + dir + len) % len;
        } while (cur !== index);
        return undefined;
    },

    /**
     * Attempts to handle a keyboard event;
     * returns true if the event was handled,
     * false otherwise.
     * If the container is enabled, and a child is highlighted,
     * calls the child control's {@code handleKeydown} method to give the control
     * a chance to handle the event first.
     * Protected, should only be overridden by subclasses.
     * @param {KISSY.Event.DomEvent.Object} e Key event to handle.
     * @return {Boolean|undefined} Whether the event was handled by the container (or one of
     *     its children).
     * @protected
     *
     */
    handleKeyDownInternal: function (e) {
        var self = this;
        // Give the highlighted control the chance to handle the key event.
        var highlightedItem = self.get('highlightedItem');

        // 先看当前活跃 menuitem 是否要处理
        if (highlightedItem && highlightedItem.handleKeyDownInternal(e)) {
            return true;
        }

        var children = self.get('children');
        var len = children.length;

        if (len === 0) {
            return undefined;
        }

        var index, destIndex, nextHighlighted;

        //自己处理了，不要向上处理，嵌套菜单情况
        switch (e.keyCode) {
            // esc
            case KeyCode.ESC:
                // 清除所有菜单
                if ((highlightedItem = self.get('highlightedItem'))) {
                    highlightedItem.set('highlighted', false);
                }
                break;

            // home
            case KeyCode.HOME:
                nextHighlighted = self._getNextEnabledHighlighted(0, 1);
                break;
            // end
            case KeyCode.END:
                nextHighlighted = self._getNextEnabledHighlighted(len - 1, -1);
                break;
            // up
            case KeyCode.UP:
                if (!highlightedItem) {
                    destIndex = len - 1;
                } else {
                    index = util.indexOf(highlightedItem, children);
                    destIndex = (index - 1 + len) % len;
                }
                nextHighlighted = self._getNextEnabledHighlighted(destIndex, -1);
                break;
            //down
            case KeyCode.DOWN:
                if (!highlightedItem) {
                    destIndex = 0;
                } else {
                    index = util.indexOf(highlightedItem, children);
                    destIndex = (index + 1 + len) % len;
                }
                nextHighlighted = self._getNextEnabledHighlighted(destIndex, 1);
                break;
        }
        if (nextHighlighted) {
            nextHighlighted.set('highlighted', true, {
                data: {
                    fromKeyboard: 1
                }
            });
            return true;
        } else {
            return undefined;
        }
    },

    /**
     * Whether this menu contains specified html element.
     * @param {KISSY.Node} element html Element to be tested.
     * @return {Boolean}
     * @protected
     */
    containsElement: function (element) {
        var self = this;
        var $el = self.$el;

        // 隐藏当然不包含了
        if (!self.get('visible') || !$el) {
            return false;
        }

        if ($el && ($el[0] === element || $el.contains(element))) {
            return true;
        }

        var children = self.get('children');

        for (var i = 0, count = children.length; i < count; i++) {
            var child = children[i];
            if (child.containsElement && child.containsElement(element)) {
                return true;
            }
        }

        return false;
    }
}, {
    ATTRS: {
        handleGestureEvents: {
            value: true
        },

        focusable: {
            value: true
        },

        allowTextSelection: {
            value: false
        },

        /**
         * Current highlighted child menu item.
         * @type {KISSY.Menu.Item}
         * @property highlightedItem
         * @readonly
         */
        /**
         * @ignore
         */
        highlightedItem: {
            value: null
        },

        defaultChildCfg: {
            valueFn: function () {
                return {
                    xclass: 'menuitem'
                };
            }
        }
    },
    xclass: 'menu'
});

// capture bubbling
function afterHighlightedItemChange(e) {
    if (e.target.isMenu) {
        var el = this.el,
            menuItem = e.newVal;
        el.setAttribute('aria-activedescendant', menuItem && menuItem.el.id || '');
    }
}

/**
 * @ignore
 * 普通菜单可聚焦
 * 通过 tab 聚焦到菜单的根节点，通过上下左右操作子菜单项
 *
 * TODO
 *  - 去除 activeItem. done@2013-03-12
 **/