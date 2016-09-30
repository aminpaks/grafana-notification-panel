import {
    MetricsPanelCtrl
} from 'app/plugins/sdk';
import TimeSeries from 'app/core/time_series';
import _ from 'lodash';

class NotificationCtrl extends MetricsPanelCtrl {

    /** @ngInject */
    constructor($scope, $injector, $rootScope, templateSrv) {
        super($scope, $injector);

        this.$rootScope = $rootScope;
        this.templateSrv = templateSrv;

        var panelDefaults = {
            links: [],
            datasource: null,
            autoHide: false,
            autoHideTimeout: 5000,
            valueName: 'avg',
            thresholds: '',
            nullPointMode: 'connected',
        };

        _.defaults(this.panel, panelDefaults);

        this.events.on('render', this.onRender.bind(this));
        this.events.on('data-received', this.onDataReceived.bind(this));
        this.events.on('data-snapshot-load', this.onDataReceived.bind(this));
        this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
        this.events.on('data-error', this.onDataError.bind(this));

        this.content = 'Loading...';

        if (!Notification) {
            this.content = 'Your browser doesn\' support notification';
        } else
        if (Notification.permission != 'granted') {
            Notification.requestPermission();
        }
    }

    onInitEditMode() {
        this.addEditorTab('Options', 'public/plugins/aminpaks-notification-panel/editor.html', 2);
    }

    onDataError(err) {
        this.onDataReceived([]);
    }

    onDataReceived(dataList) {
        console.log('NotificationCtrl.onDataReceived');

        // Receives data make the series
        this.series = dataList.map(this.seriesHandler.bind(this));

        // Refines values
        this.data = this.setValues(this.series);

        // Render components
        this.render();
    }

    onRender() {
        console.log('NotificationCtrl.onRender');

        if (!this.data) {
            return;
        }

        var data = this.data;

        data.thresholds = this.panel.thresholds.split(',').map(function(strValue) {
            return Number(strValue.trim());
        });

        this.content = data.value;

        // Only instiantiate when it's not in EditMode.
        if (!this.editMode) {

            // Checks if the value is within thresholds
            if (data.value > 0) {


                var settings = {
                    autoHide: this.panel.autoHide && this.panel.autoHideTimeout,
                }

                // Notifies the user
                this.notify('The value exceeded!', '', settings);
            }
        }
    }

    seriesHandler(seriesData) {
        console.log('NotificationCtrl.seriesHandler');
        var series = new TimeSeries({
            datapoints: seriesData.datapoints,
            alias: seriesData.target
        });

        series.flotpairs = series.getFlotPairs(this.panel.nullPointMode);
        return series;
    }

    notify(message, body, settings) {
        var defaultSettings = {
            // tag: null,
            // body: body,
            icon: 'public/plugins/aminpaks-notification-panel/img/exclamation.png',
        };

        _.defaults(settings, defaultSettings);

        var notify;
        var autoHideTimeout = settings.autoHide;
        var onshow = function() {
            setTimeout(function() {

                notify.close();

            }, autoHideTimeout);
        };

        delete settings['autoHide'];

        notify = new Notification(message, settings);
        notify.onshow = onshow;

        return notify;
    }

    setValues(series) {
        var data = {}
        if (series.length > 1) {
            var error = new Error();
            error.message = 'Multiple Series Error';
            error.data = 'Metric query returns ' + series.length +
                ' series. Single Stat Panel expects a single series.\n\nResponse:\n' + JSON.stringify(series);
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

    // link(scope, elem, attrs, ctrl) {
    //     console.log(ctrl);
    // }
}

NotificationCtrl.templateUrl = 'module.html';

export {
    NotificationCtrl
};
