import { trans } from "@mongez/localization";
import { Link } from "@mongez/react-router";
import { cartAtom } from "apps/front-office/cart/atoms/cart-atom";
import Loader, {
  Error,
} from "apps/front-office/design-system/components/Indicators/Indicators";
import {
  useHeaderState,
  useHeaderStateClose,
} from "apps/front-office/design-system/hooks/headerStateHook";
import useEscapeToClose from "apps/front-office/design-system/hooks/useEscapeToClose";
import { price } from "apps/front-office/utils/price";
import URLS from "apps/front-office/utils/urls";
import { IoClose, IoCloseSharp } from "react-icons/io5";
import useCart from "shared/hooks/useCart";

export type State = "initial" | "loading" | "failed" | "loaded";

export default function CartProducts() {
  const opened = useHeaderState("cartIcon");
  const closeCart = useHeaderStateClose("cartIcon");

  const { state, error, removeItemFromCart } = useCart();
  const cart = cartAtom.useValue();

  useEscapeToClose(opened, closeCart);

  if (state === "loading") {
    return <Loader />;
  }

  if (state === "failed" && error) {
    return <Error error={error} />;
  }

  if (!cart?.id) return null;

  const items = cart.items || [];

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-row justify-between py-5 px-[15px] border-b">
        <h1 className="text-xl font-bold uppercase">{trans("shoppingCart")}</h1>

        <button
          onClick={closeCart}
          className="flex flex-row items-center cursor-pointer text-bodyTextColor text-sm font-semibold">
          {trans("close")} <IoCloseSharp />
        </button>
      </div>
      {items.length === 0 ? (
        <p className="text-lg text-center m-6 text-headingTextColor">
          {trans("noProductsInCart")}
        </p>
      ) : (
        <>
          <div className="flex flex-col h-full overflow-auto px-5">
            {items.map(item => (
              <div
                key={item.meal.id}
                className="flex flex-row py-3 border-b border-border gap-2">
                <button
                  onClick={() => removeItemFromCart(item.id)}
                  className="self-center border-gray-400 rounded-full border w-4 h-4 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-500"
                  title={trans("removeFromCart")}>
                  <IoClose />
                </button>
                <div className=" bg-border rounded-[44%] w-[64px]">
                  <img src={item.meal.image.url} alt={item.meal.name} />
                </div>
                <div className="flex flex-col">
                  <Link
                    className="font-thin text-[15px] hover:text-primary-hover"
                    to={URLS.menu.viewMeal(item.meal)}>
                    {item.meal.name}
                  </Link>
                  <span className="text-sm">x{item.quantity}</span>
                  <span className="text-sm text-primary-main">
                    {price(item.totalPrice)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-5 flex flex-col gap-2 border-t">
            <div className="flex flex-row justify-between items-center w-full">
              <h4 className="font-bold text-base">{trans("subtotal")} :</h4>
              <span className="font-bold text-xl">
                {price(cart.total.price)}
              </span>
            </div>
            <Link
              onClick={closeCart}
              to={`${URLS.checkout.page}`}
              className="bg-primary-main text-sm rounded-md py-4 text-black uppercase flex justify-around font-bold">
              {trans("checkout")}
            </Link>
            <Link
              onClick={closeCart}
              to={`${URLS.cart}`}
              className="rounded-md py-4 border border-black text-black uppercase flex justify-around font-bold text-sm">
              {trans("viewCart")}
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
