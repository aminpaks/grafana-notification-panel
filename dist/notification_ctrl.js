'use strict';

System.register(['app/plugins/sdk', 'app/core/time_series', 'lodash'], function (_export, _context) {
    "use strict";

    var MetricsPanelCtrl, TimeSeries, _, _createClass, NotificationCtrl;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    function _possibleConstructorReturn(self, call) {
        if (!self) {
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }

        return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }

    function _inherits(subClass, superClass) {
        if (typeof superClass !== "function" && superClass !== null) {
            throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
        }

        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }

    return {
        setters: [function (_appPluginsSdk) {
            MetricsPanelCtrl = _appPluginsSdk.MetricsPanelCtrl;
        }, function (_appCoreTime_series) {
            TimeSeries = _appCoreTime_series.default;
        }, function (_lodash) {
            _ = _lodash.default;
        }],
        execute: function () {
            _createClass = function () {
                function defineProperties(target, props) {
                    for (var i = 0; i < props.length; i++) {
                        var descriptor = props[i];
                        descriptor.enumerable = descriptor.enumerable || false;
                        descriptor.configurable = true;
                        if ("value" in descriptor) descriptor.writable = true;
                        Object.defineProperty(target, descriptor.key, descriptor);
                    }
                }

                return function (Constructor, protoProps, staticProps) {
                    if (protoProps) defineProperties(Constructor.prototype, protoProps);
                    if (staticProps) defineProperties(Constructor, staticProps);
                    return Constructor;
                };
            }();

            _export('NotificationCtrl', NotificationCtrl = function (_MetricsPanelCtrl) {
                _inherits(NotificationCtrl, _MetricsPanelCtrl);

                /** @ngInject */
                function NotificationCtrl($scope, $injector, $rootScope, templateSrv) {
                    _classCallCheck(this, NotificationCtrl);

                    var _this = _possibleConstructorReturn(this, (NotificationCtrl.__proto__ || Object.getPrototypeOf(NotificationCtrl)).call(this, $scope, $injector));

                    _this.$rootScope = $rootScope;
                    _this.templateSrv = templateSrv;

                    var panelDefaults = {
                        links: [],
                        datasource: null,
                        autoHide: false,
                        autoHideTimeout: 5000,
                        valueName: 'avg',
                        thresholds: '',
                        nullPointMode: 'connected'
                    };

                    _.defaults(_this.panel, panelDefaults);

                    _this.events.on('render', _this.onRender.bind(_this));
                    _this.events.on('data-received', _this.onDataReceived.bind(_this));
                    _this.events.on('data-snapshot-load', _this.onDataReceived.bind(_this));
                    _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_this));
                    _this.events.on('data-error', _this.onDataError.bind(_this));

                    _this.content = 'Loading...';

                    if (!Notification) {
                        _this.content = 'Your browser doesn\' support notification';
                    } else if (Notification.permission != 'granted') {
                        Notification.requestPermission();
                    }
                    return _this;
                }

                _createClass(NotificationCtrl, [{
                    key: 'onInitEditMode',
                    value: function onInitEditMode() {
                        this.addEditorTab('Options', 'public/plugins/aminpaks-notification-panel/editor.html', 2);
                    }
                }, {
                    key: 'onDataError',
                    value: function onDataError(err) {
                        this.onDataReceived([]);
                    }
                }, {
                    key: 'onDataReceived',
                    value: function onDataReceived(dataList) {
                        console.log('NotificationCtrl.onDataReceived');

                        // Receives data make the series
                        this.series = dataList.map(this.seriesHandler.bind(this));

                        // Refines values
                        this.data = this.setValues(this.series);

                        // Render components
                        this.render();
                    }
                }, {
                    key: 'onRender',
                    value: function onRender() {
                        console.log('NotificationCtrl.onRender');

                        if (!this.data) {
                            return;
                        }

                        var data = this.data;

                        data.thresholds = this.panel.thresholds.split(',').map(function (strValue) {
                            return Number(strValue.trim());
                        });

                        this.content = data.value;

                        // Only instiantiate when it's not in EditMode.
                        if (!this.editMode) {

                            // Checks if the value is within thresholds
                            if (data.value > 0) {

                                var settings = {
                                    autoHide: this.panel.autoHide && this.panel.autoHideTimeout
                                };

                                // Notifies the user
                                this.notify('The value exceeded!', '', settings);
                            }
                        }
                    }
                }, {
                    key: 'seriesHandler',
                    value: function seriesHandler(seriesData) {
                        console.log('NotificationCtrl.seriesHandler');
                        var series = new TimeSeries({
                            datapoints: seriesData.datapoints,
                            alias: seriesData.target
                        });

                        series.flotpairs = series.getFlotPairs(this.panel.nullPointMode);
                        return series;
                    }
                }, {
                    key: 'notify',
                    value: function notify(message, body, settings) {
                        var defaultSettings = {
                            // tag: null,
                            // body: body,
                            icon: 'public/plugins/aminpaks-notification-panel/img/exclamation.png'
                        };

                        _.defaults(settings, defaultSettings);

                        var notify;
                        var autoHideTimeout = settings.autoHide;
                        var onshow = function onshow() {
                            setTimeout(function () {

                                notify.close();
                            }, autoHideTimeout);
                        };

                        delete settings['autoHide'];

                        notify = new Notification(message, settings);
                        notify.onshow = onshow;

                        return notify;
                    }
                }, {
                    key: 'setValues',
                    value: function setValues(series) {
                        var data = {};
                        if (series.length > 1) {
                            var error = new Error();
                            error.message = 'Multiple Series Error';
                            error.data = 'Metric query returns ' + series.length + ' series. Single Stat Panel expects a single series.\n\nResponse:\n' + JSON.stringify(series);
                            throw error;
                        }

                        if (series && series.length > 0) {
                            var lastPoint = _.last(series[0].datapoints);
                            var lastValue = _.isArray(lastPoint) ? lastPoint[0] : null;

                            if (this.panel.valueName === 'name') {
                                data.value = 0;
                                data.valueRounded = 0;
                                data.valueFormated = series[0].alias;
                            } else if (_.isString(lastValue)) {
                                data.value = 0;
                                data.valueFormated = _.escape(lastValue);
                                data.valueRounded = 0;
                            } else {
                                data.value = series[0].stats[this.panel.valueName];
                                data.flotpairs = series[0].flotpairs;

                                // var decimalInfo = this.getDecimalsForValue(data.value);
                                // var formatFunc = kbn.valueFormats[this.panel.format];
                                // data.valueFormated = formatFunc(data.value, decimalInfo.decimals, decimalInfo.scaledDecimals);
                                // data.valueRounded = kbn.roundValue(data.value, decimalInfo.decimals);
                            }

                            // Add $__name variable for using in prefix or postfix
                            data.scopedVars = {
                                __name: {
                                    value: series[0].label
                                }
                            };
                        }

                        console.log(lastPoint, lastValue, data, series[0].stats);

                        return data;
                    }
                }]);

                return NotificationCtrl;
            }(MetricsPanelCtrl));

            NotificationCtrl.templateUrl = 'module.html';

            _export('NotificationCtrl', NotificationCtrl);
        }
    };
});
//# sourceMappingURL=notification_ctrl.js.map
