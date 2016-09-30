'use strict';

System.register(['./notification_ctrl'], function (_export, _context) {
    "use strict";

    var NotificationCtrl;
    return {
        setters: [function (_notification_ctrl) {
            NotificationCtrl = _notification_ctrl.NotificationCtrl;
        }],
        execute: function () {
            _export('NotificationCtrl', NotificationCtrl);

            _export('PanelCtrl', NotificationCtrl);
        }
    };
});
//# sourceMappingURL=module.js.map
