/**
 * Tc For KISSY Menu.
 * @author yiminghe@gmail.com
 */
/*jshint quotmark:false*/

var $ = require('node'),
    UA = require('ua'),
    Menu = require('menu'),
    KeyCode = $.Event.KeyCode;

describe('menu', function () {
    var menu, menuEl, menuChildren, firstEl, secondEl;

    function simpleTest() {
        it('render works', function () {
            expect(menuEl.children().length).to.be(2);
        });

        if (!UA.mobile) {
            it("highlighted works", function (done) {
                window.simulateEvent(firstEl, 'mouseover');

                async.series([
                    waits(10),

                    runs(function () {
                        expect(menuChildren[0].get('highlighted')).to.be(true);
                        expect(menuChildren[0].get('el')
                            .hasClass('ks-menuitem-hover')).to.be.ok();
                        expect(menuChildren[1].get('highlighted')).not.to.be.ok();
                        expect(menuChildren[1].get('el')
                            .hasClass('ks-menuitem-hover')).not.to.be.ok();
                    }),

                    runs(function () {
                        window.simulateEvent(firstEl, "mouseout");
                    }),

                    waits(10),

                    runs(function () {
                        window.simulateEvent(secondEl, 'mouseover');
                    }),

                    waits(10),

                    runs(function () {
                        expect(menuChildren[0].get('highlighted')).to.be(false);
                        expect(menuChildren[0].get('el')
                            .hasClass('ks-menuitem-hover')).not.to.be.ok();
                        expect(menuChildren[1].get('highlighted')).to.be(true);
                        expect(menuChildren[1].get('el')
                            .hasClass('ks-menuitem-hover')).to.be.ok();
                    })], done);
            });

            it("down key works", function (done) {
                window.simulateEvent(firstEl, "mouseout");

                async.series([
                    waits(10),

                    runs(function () {
                        window.simulateEvent(secondEl, "mouseout");
                    }),

                    waits(10),

                    runs(function () {
                        window.simulateEvent(menuEl[0], 'keydown', {
                            keyCode: KeyCode.UP
                        });
                        window.simulateEvent(menuEl[0], "keyup", {
                            keyCode: KeyCode.UP
                        });
                    }),

                    waits(10),

                    runs(function () {
                        expect(menuChildren[0].get('highlighted')).to.be(false);
                        expect(menuChildren[0].get('el')
                            .hasClass('ks-menuitem-hover')).not.to.be.ok();
                        expect(menuChildren[1].get('highlighted')).to.be(true);
                        expect(menuChildren[1].get('el')
                            .hasClass('ks-menuitem-hover')).to.be.ok();
                    }),

                    runs(function () {
                        window.simulateEvent(menuEl[0], 'keydown', {
                            keyCode: KeyCode.UP
                        });
                        window.simulateEvent(menuEl[0], "keyup", {
                            keyCode: KeyCode.UP
                        });
                    }),

                    waits(10),

                    runs(function () {
                        expect(menuChildren[0].get('highlighted')).to.be(true);
                        expect(menuChildren[0].get('el')
                            .hasClass('ks-menuitem-hover')).to.be.ok();
                        expect(menuChildren[1].get('highlighted')).not.to.be.ok();
                        expect(menuChildren[1].get('el')
                            .hasClass('ks-menuitem-hover')).not.to.be.ok();
                    })], done);
            });

            it("enter works and event bubbles", function (done) {
                var ret1 = 0, ret2 = 0;

                menu.on("click.my", function (e) {
                    ret1++;
                    expect(e.target).to.be(menuChildren[1]);
                });

                menuChildren[1].on("click.my", function () {
                    ret2++;
                });


                window.simulateEvent(firstEl, "mouseout");

                async.series([
                    waits(10),

                    runs(function () {
                        window.simulateEvent(secondEl, 'mouseover');
                    }),

                    waits(10),

                    runs(function () {
                        expect(menuChildren[0].get('highlighted')).to.be(false);
                        expect(menuChildren[0].get('el')
                            .hasClass('ks-menuitem-hover')).not.to.be.ok();
                        expect(menuChildren[1].get('highlighted')).to.be(true);
                        expect(menuChildren[1].get('el')
                            .hasClass('ks-menuitem-hover')).to.be.ok();
                    }),

                    runs(function () {
                        window.simulateEvent(menuEl[0], 'keydown', {
                            keyCode: KeyCode.ENTER
                        });
                        window.simulateEvent(menuEl[0], "keyup", {
                            keyCode: KeyCode.ENTER
                        });
                    }),

                    waits(10),

                    runs(function () {
                        expect(ret1).to.be(1);
                        expect(ret2).to.be(1);

                        menu.detach(".my");

                        menuChildren[1].detach(".my");
                    }),

                    runs(function () {
                        window.simulateEvent(menuEl[0], 'keydown', {
                            keyCode: KeyCode.ENTER
                        });
                        window.simulateEvent(menuEl[0], "keyup", {
                            keyCode: KeyCode.ENTER
                        });
                    }),

                    waits(10),

                    runs(function () {
                        expect(ret1).to.be(1);
                        expect(ret2).to.be(1);
                    })], done);
            });

            it("click works and bubbles", function (done) {
                var ret1 = 0, ret2 = 0;

                menu.on("click.my", function (e) {
                    ret1++;
                    expect(e.target).to.be(menuChildren[1]);
                });

                menuChildren[1].on("click.my", function () {
                    ret2++;
                });

                window.simulateEvent(firstEl, "mouseout");

                async.series([
                    waits(100),

                    runs(function () {
                        window.simulateEvent(secondEl, 'mouseover');
                    }),

                    waits(100),

                    runs(function () {
                        expect(menuChildren[0].get('highlighted')).to.be(false);
                        expect(menuChildren[0].get('el')
                            .hasClass('ks-menuitem-hover')).not.to.be.ok();
                        expect(menuChildren[1].get('highlighted')).to.be(true);
                        expect(menuChildren[1].get('el')
                            .hasClass('ks-menuitem-hover')).to.be.ok();
                    }),

                    runs(function () {
                        // click
                        window.simulateEvent(secondEl, 'click');
                    }),

                    waits(100),

                    runs(function () {
                        expect(ret1).to.be(1);
                        expect(ret2).to.be(1);

                        menu.detach(".my");

                        menuChildren[1].detach(".my");
                    }),

                    runs(function () {
                        window.simulateEvent(secondEl, 'mousedown');
                        window.simulateEvent(secondEl, "mouseup");
                    }),

                    waits(100),

                    runs(function () {
                        expect(ret1).to.be(1);
                        expect(ret2).to.be(1);
                    })], done);
            });
        }
    }

    describe('javascript render', function () {
        beforeEach(function () {
            menu = new Menu({

                width: 150,
                children: [
                    {
                        content: "item1"
                    },
                    {
                        content: 'item2'
                    }
                ]

            }).render();

            menuEl = menu.get('el');
            menuChildren = menu.get('children');

            firstEl = menuEl.children()[0];

            secondEl = menuEl.children()[1];
        });

        afterEach(function () {
            menu.destroy();
        });

        simpleTest();
    });


    describe('srcNode render', function () {
        beforeEach(function () {
            var render = $('<div class="ks-menu">' +
                '<div class="ks-menuitem">item1</div>' +
                '<div class="ks-menuitem">item2</div>' +
                '</div>').prependTo('body');

            menu = new Menu({
                srcNode: render
            }).render();

            menuEl = menu.get('el');
            menuChildren = menu.get('children');

            firstEl = menuEl.children()[0];

            secondEl = menuEl.children()[1];
        });

        afterEach(function () {
            menu.destroy();
        });

        simpleTest();
    });
});
