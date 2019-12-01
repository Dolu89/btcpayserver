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

                basket: [],

                customAmount: '',
                discount: '',
                tip: '',
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
            },
            totalProducts: function () {
                var totalProducts = 0;
                for (var i = 0; i < this.basketDisplay.length; i++) {
                    totalProducts += this.basketDisplay[i].qty * this.basketDisplay[i].price.value;
                }
                return totalProducts;
            },
            totalProductsCustomAmount: function () {
                return this.totalProducts + this.toNumber(this.customAmount);
            },
            totalProductsFormatted: function () {
                return this.formatCurrency(this.totalProductsCustomAmount);
            },
            totalBasket: function () {
                var total = 0;

                //Add products prices
                total += this.toCents(this.totalProducts);
                //Add custom price
                total += this.toCents(this.customAmount);

                //Add discount
                total -= this.percentage(total, this.toCents(this.toNumber(this.discount)));

                return total;
            },
            totalBasketFormatted: function () {
                return this.formatCurrency(this.fromCents(this.totalBasket));
            },
            total: function () {
                var total = 0;

                //Add calculated totalBasket
                total += this.toNumber(this.totalBasket);
                //Add tip
                total += this.toCents(this.tip);

                return total;
            },
            totalFormatted: function () {
                return this.formatCurrency(this.fromCents(this.total));
            },
            discountFormatted: function () {
                var discount = this.percentage(this.totalProductsCustomAmount, this.toCents(this.discount));
                if (discount > 0) {
                    return '-' + this.formatCurrency(discount);
                }
                else {
                    return this.formatCurrency(discount);
                }
            },
            tipFormatted: function () {
                return this.formatCurrency(this.toNumber(this.tip));
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
                for (var y = indexesToRemove.length - 1; y >= 0; y--) {
                    this.basket.splice(indexesToRemove[y], 1);
                }
            },
            emptyBasket: function () {
                this.basket = [];
                this.discount = '';
                this.customAmount = '';
            },

            toCents: function (num) {
                return num * Math.pow(10, this.srvModel.currencyInfo.divisibility);
            },
            fromCents: function (num) {
                return num / Math.pow(10, srvModel.currencyInfo.divisibility);
            },
            percentage: function (amount, percentage) {
                return this.fromCents((amount / 100) * percentage);
            },
            toNumber: function (num) {
                return (num * 1) || 0;
            },
            formatCurrency: function (amount) {
                var amt = '',
                    thousandsSep = '',
                    decimalSep = '',
                    prefix = '',
                    postfix = '';

                if (this.srvModel.currencyInfo.prefixed) {
                    prefix = this.srvModel.currencyInfo.currencySymbol;
                    if (this.srvModel.currencyInfo.symbolSpace) {
                        prefix = prefix + ' ';
                    }

                }
                else {
                    postfix = this.srvModel.currencyInfo.currencySymbol;
                    if (this.srvModel.currencyInfo.symbolSpace) {
                        postfix = ' ' + postfix;
                    }

                }
                thousandsSep = this.srvModel.currencyInfo.thousandSeparator;
                decimalSep = this.srvModel.currencyInfo.decimalSeparator;
                amt = amount.toFixed(srvModel.currencyInfo.divisibility);

                // Add currency sign and thousands separator
                var splittedAmount = amt.split('.');
                amt = (splittedAmount[0] + '.').replace(/(\d)(?=(\d{3})+\.)/g, '$1' + thousandsSep);
                amt = amt.substr(0, amt.length - 1);
                if (splittedAmount.length == 2) {
                    amt = amt + decimalSep + splittedAmount[1];
                }
                if (this.srvModel.currencyInfo.divisibility !== 0) {
                    amt[amt.length - this.srvModel.currencyInfo.divisibility - 1] = decimalSep;
                }
                amt = prefix + amt + postfix;

                return amt;
            },
            setTipPercent(percentage) {
                this.tip = this.fromCents(Math.round(percentage * this.totalBasket / 100));
            }
        },
        mounted: function () {
            console.log(this.srvModel);
        }
    });
});
