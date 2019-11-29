var app = null;

function addLoadEvent(func) {
    var oldonload = window.onload;
    if (typeof window.onload !== 'function') {
        window.onload = func;
    } else {
        window.onload = function () {
            if (oldonload) {
                oldonload();
            }
            func();
        };
    }
}
addLoadEvent(function (ev) {

    if (!String.prototype.format) {
        String.prototype.format = function () {
            var args = arguments;
            return this.replace(/{(\d+)}/g, function (match, number) {
                return typeof args[number] !== 'undefined'
                    ? args[number]
                    : match
                    ;
            });
        };
    }

    app = new Vue({
        el: '#app',
        data: function () {
            return {
                srvModel: window.srvModel,
                products: window.srvModel.items,
                searchBar: ''
            };
        },
        computed: {
            productsFiltered: function () {
                if (this.searchBar !== '') {
                    return this.products.filter(product => product.title.toLowerCase().indexOf(this.searchBar.toLowerCase()) !== -1);
                }
                else {
                    return this.products;
                }
            }
        },
        methods: {
            buttonText: function (btnText, price) {
                return btnText.format(price);
            },
            getInventoryMessage: function (inventory) {
                if (inventory > 0) {
                    return inventory + ' left';
                }
                else {
                    return 'Sold out';
                }
            }
        },
        mounted: function () {
            console.log(this.srvModel);
        }
    });
});
