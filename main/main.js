const datbase = require('./datbase');
const allItems = datbase.loadAllItems();
const allPromotions = datbase.loadPromotions();

    module.exports = function main(inputs) {
    const cartItems = buildInputs(inputs);
    const receiptItems = getPromotion(cartItems,allPromotions);
    const receipts = buildTotal(receiptItems);
    const printfText = buildPrint(receipts,allPromotions);
    console.log(printfText);
};

function buildInputs(inputs) {
    var cartItems = [];
    for(const input of inputs) {
        const inputArray = input.split('-');
        const barcode = inputArray[0];
        let count = inputArray[1] ? Number(inputArray[1]) : 1;
        const cartItem = cartItems.find(cartItem=>cartItem.item.barcode===barcode);

        if(cartItem) {
            cartItem.count += count;
        } else {
            const item=allItems.find(item=>item.barcode===barcode);
                cartItems.push({item,count});
            }
        }
        return cartItems;
}

//优惠小计节省
function getPromotion(cartItems,allPromotions) {
    return cartItems.map(function(cartItem) {
        let saved = 0;
        let subtotal = cartItem.item.price * cartItem.count;
        const promotionType = promotionsType(cartItem.item.barcode,allPromotions);
        if(promotionType === "BUY_TWO_GET_ONE_FREE") {
            saved = parseInt(cartItem.count/3) * cartItem.item.price;
        }
        subtotal -= saved;
        return {cartItem,subtotal,saved};
    })
}

//优惠类型
function promotionsType(barcode,allPromotions) {
    const promotion = allPromotions.find(promotion => promotion.barcodes.some(bar => bar === barcode));
    return promotion ? promotion.type: undefined;
}

//总计
function buildTotal(receiptItems) {
    var total = 0;
    var savedTotal = 0;
    for(var receiptItem of receiptItems) {
        total += receiptItem.subtotal;
        savedTotal += receiptItem.saved;
    }
    return {receiptItems,total,savedTotal};
}

//打印
function buildPrint(receipts,promotions) {
    var str ="***<没钱赚商店>购物清单***";
    receipts.receiptItems.map(receiptItem => {
        const cartItem = receiptItem.cartItem;
        str += '\n' +'名称：' + cartItem.item.name + '，数量：' + cartItem.count + cartItem.item.unit + '，单价：' + (cartItem.item.price).toFixed(2) + '(元)，小计：' + (receiptItem.subtotal).toFixed(2) + '(元)'
    });

    str += "\n----------------------\n" + "挥泪赠送商品：";
    receipts.receiptItems.map(receiptItem => {
        if(receiptItem.saved > 0) {
            const cartItem = receiptItem.cartItem;
            str += '\n名称：' + cartItem.item.name + '，数量：' + parseInt(cartItem.count/3) + cartItem.item.unit;
        }
        });

    str += '\n----------------------\n总计：' + (receipts.total).toFixed(2) + '(元)';
    str += "\n节省：" + (receipts.savedTotal).toFixed(2)  + '(元)' + "\n**********************";
    return str;
}