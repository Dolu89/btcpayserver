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
                searchBar: '',

                basket: []
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
            },
            basketCount: function () {
                return this.basket.length;
            },
            basketDisplay: function () {
                var basketDisplay = [];

                for (var i = 0; i < this.basket.length; i++) {
                    var currentItem = this.basket[i];
                    var index = basketDisplay.findIndex(p => p.id === currentItem.id);
                    if (index === -1) {
                        var newItem = JSON.parse(JSON.stringify(currentItem));
                        newItem['qty'] = 1;
                        basketDisplay.push(newItem);
                    }
                    else {
                        basketDisplay[index]['qty'] += 1;
                    }
                }


                return basketDisplay;
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
            },
            addToBasket: function (product) {
                this.basket.push(product);
            },
            removeFromBasket: function (product) {
                var index = this.basket.findIndex(p => p.id === product.id);
                this.basket.splice(index, 1);
            },
            removeItemFromBasket: function (productId) {
                var indexesToRemove = [];
                for (var i = 0; i < this.basket.length; i++) {
                    if (this.basket[i].id === productId) {
                        indexesToRemove.push(i);
                    }
                }
                for (var y = indexesToRemove.length -1; y >= 0; y--) {
                    this.basket.splice(indexesToRemove[y], 1);
                }
            },
            emptyBasket: function () {
                this.basket = [];
            }
        },
        mounted: function () {
            console.log(this.srvModel);
        }
    });
});
