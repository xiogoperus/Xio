;
(function($window) {
    'use strict';

    var insertAfter = function(elem, refElem) {
            if (!refElem || !elem) {
                return;
            }
            var parent = refElem.parentNode;
            var next = refElem.nextSibling;
            if (next) {
                return parent.insertBefore(elem, next);
            } else {
                return parent.appendChild(elem);
            }
        },

        addListenerMulti = function(element, eventNames, listener) {
            var events = eventNames.split(' ');
            for (var i = 0, iLen = events.length; i < iLen; i++) {
                element.addEventListener(events[i], listener, false);
            }
        },

        guid = function() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }
            return s4() + s4() + '_' + s4();
        },

        createChilds = function(parentElement, params) {
            var nodeList = $window.document.createDocumentFragment();
            for (var i = 0; i < params.length; i++) {
                var param = params[i];
                var element = $window.document.createElement(param.tagName);
                if (param.classNames)
                    for (var j = 0; j < param.classNames.length; j++) {
                        var className = param.classNames[j];
                        if (className.name && className.name.indexOf(' ') === -1)
                            element.classList.add(className.name);
                    }
                if (param.attributes)
                    for (var j = 0; j < param.attributes.length; j++) {
                        var attribute = param.attributes[j];
                        if (attribute.name)
                            element.setAttribute(attribute.name, attribute.value || '');
                    }
                nodeList.appendChild(element);
            }
            while (parentElement.firstChild) {
                parentElement.firstChild.remove();
            }
            parentElement.appendChild(nodeList);
        },

        recursiveSearch = function(element) {
            if (element.children.length === 1) {
                recursiveSearch(element.children[0]);
            } else {
                element.innerText = element.innerText.charAt(0).toUpperCase() + element.innerText.slice(1);
                return;
            }
        },

        correctAllText = function(elements) {
            if (!elements || elements.length === undefined) {
                return;
            }
            for (var i = 0; i < elements.length; i++) {
                recursiveSearch(elements[i]);
            };
        },

        moveFromMenu = function(menuList, menuElements) {
            if (!menuElements) {
                return;
            }
            var hr = $window.document.createElement('div');
            hr.classList.add('xs-menu-line');
            if (menuElements.length === undefined && menuElements.tagName !== undefined) {
                menuList.appendChild(menuElements);
            } else {
                for (var i = 0; i < menuElements.length; i++) {
                    var cloneMenu = menuElements[i].cloneNode(true);
                    if (i === 0) {
                        cloneMenu.classList.add('xs-first');
                    }
                    if (i === menuElements.length - 1) {
                        cloneMenu.classList.add('xs-last');
                    }
                    menuList.appendChild(cloneMenu);
                    if (i !== 1 && i !== menuElements.length - 1) {
                        menuList.appendChild(hr.cloneNode(true));
                    }
                    menuElements[i].classList.add('xs-menu');
                }
            }
        },

        changeElements = function(firstElement, lastElement, queryPoint, clone) {
            queryPoint = queryPoint || 1200;
            if (!firstElement || !lastElement) {
                return;
            }
            var origElement = $window.document.createElement('div');
            var fGuid = 'first_' + guid();
            var lGuid = 'last_' + guid();
            firstElement.dataset.changeElement = fGuid;
            var fixFirst = origElement.cloneNode(false);
            fixFirst.dataset.changeFix = fGuid;
            firstElement.parentElement.insertBefore(fixFirst, firstElement);
            lastElement.dataset.changeElement = lGuid;
            var fixLast = origElement.cloneNode(false);
            fixLast.dataset.changeFix = lGuid;
            lastElement.parentElement.insertBefore(fixLast, lastElement);
            if (clone === 1 || clone === 2) {
                var tmpElement = clone === 1 ? firstElement.cloneNode(true) : lastElement.cloneNode(true);
                addListenerMulti($window, 'load resize', function(e) {
                    if (this.document.body.clientWidth <= queryPoint) {
                        firstElement.remove();
                        lastElement.remove();
                        insertAfter(clone === 1 ? firstElement : lastElement, fixFirst);
                        insertAfter(tmpElement, fixLast);
                    } else {
                        insertAfter(firstElement, fixFirst);
                        insertAfter(lastElement, fixLast);
                        tmpElement.remove();
                    }

                });
            } else {
                addListenerMulti($window, 'load resize', function(e) {
                    if (this.document.body.clientWidth <= queryPoint) {
                        insertAfter(lastElement, fixFirst);
                        insertAfter(firstElement, fixLast);
                    } else {
                        insertAfter(firstElement, fixFirst);
                        insertAfter(lastElement, fixLast);
                    }

                });
            }
        },

        xs = $window.xs = {
            config: {
                btnIconListLists: [{
                    tagName: 'div',
                    classNames: [{ name: 'xs-line' }]
                }, {
                    tagName: 'div',
                    classNames: [{ name: 'xs-line' }, { name: 'xs-line-margin' }]
                }, {
                    tagName: 'div',
                    classNames: [{ name: 'xs-line' }]
                }],
                btnIconCloseLists: [{
                    tagName: 'div',
                    classNames: [{ name: 'xs-close' }, { name: 'xs-close-left' }]
                }, {
                    tagName: 'div',
                    classNames: [{ name: 'xs-close' }, { name: 'xs-close-right' }]
                }],
                menuFixed: {
                    isFixed: true,
                    topOffset: 120
                }
            },
            correctAllText: function(elements) {
                elements = elements || $window.document.querySelectorAll('ul li, ol li');
                correctAllText(elements);
            },
            changeElements: changeElements,
            init: function(config, callback) {
                var self = this;

                var contentElement = config.contentElement,
                    menuElements = config.menuElements,
                    insertCloneButton = config.insertCloneButton;

                self.config.btnIconListLists = config.btnIconListLists || self.config.btnIconListLists;
                self.config.btnIconCloseLists = config.btnIconCloseLists || self.config.btnIconCloseLists;
                self.config.menuFixed = config.menuFixed || self.config.menuFixed;


                if (!contentElement || !menuElements || !insertCloneButton) {
                    return;
                }

                var changeButton = function() {
                    containerMenu.dataset.toggle = !(containerMenu.dataset.toggle == 'true');
                    if (containerMenu.dataset.toggle == 'true') {
                        createChilds(buttonIcons, self.config.btnIconCloseLists);
                        contentElement.classList.add('active-content');
                        containerMenu.classList.add('active-menu');
                        $window.document.body.classList.add('xs-active');
                    } else {
                        createChilds(buttonIcons, self.config.btnIconListLists);
                        contentElement.classList.remove('active-content');
                        containerMenu.classList.remove('active-menu');
                        $window.document.body.classList.remove('xs-active');
                    }
                };
                contentElement.classList.add('xs-wrapper-content');
                // Create containerMenu
                var containerMenu = $window.document.createElement('div');
                containerMenu.classList.add('xs-wrapper-menu');
                // Insert this containerMenu after contentElement
                insertAfter(containerMenu, contentElement);
                // Create a button - buttonMenu
                var buttonMenu = $window.document.createElement('div'),
                    buttonIcons = buttonMenu.cloneNode();
                buttonMenu.classList.add('xs-button');
                buttonIcons.classList.add('xs-icon');
                buttonMenu.appendChild(buttonIcons);
                createChilds(buttonIcons, self.config.btnIconListLists);

                buttonMenu.addEventListener('click', changeButton);
                // Create a list - menuList
                var menuList = $window.document.createElement('div');
                menuList.classList.add('xs-menu-list');

                moveFromMenu(menuList, menuElements);

                containerMenu.appendChild(buttonMenu);
                var cloneButon = buttonMenu.cloneNode(true);
                cloneButon.classList.add('xs-clone-button');
                cloneButon.addEventListener('click', changeButton);
                insertCloneButton.appendChild(cloneButon);
                containerMenu.appendChild(menuList);

                // Menu fixed
                if (self.config.menuFixed.isFixed) {
                    $window.addEventListener('scroll', function() {
                        if (window.pageYOffset > self.config.menuFixed.topOffset) {
                            insertCloneButton.classList.add("xs-fix-menu");
                        } else {
                            insertCloneButton.classList.remove("xs-fix-menu");
                        }
                    });
                }

                callback && callback(self);
            }
        }
})(window);