import { RunTimeDriver } from "@mongez/cache";
import Endpoint, { setCurrentEndpoint } from "@mongez/http";
import { navigateTo } from "@mongez/react-router";
import { userAtom } from "apps/front-office/account/atoms/user-atom";
import user from "apps/front-office/account/user";
import { cartAtom } from "apps/front-office/cart/atoms/cart-atom";
import { addressesAtom } from "apps/front-office/checkout/atom/checkout-atoms";
import { currentLocaleCode } from "apps/front-office/utils/helpers";
import URLS from "apps/front-office/utils/urls";
import { AxiosResponse } from "axios";
import { apiBaseUrl } from "./flags";

const endpoint = new Endpoint({
  baseURL: apiBaseUrl,
  cache: false,
  cacheOptions: {
    driver: new RunTimeDriver(),
    expiresAfter: 60 * 60 * 24 * 7, // 1 week, but because it is a runtime driver, it will be cleared when the page is refreshed
  },
});

const endpointEvents = endpoint.events;

// interceptors requests
endpointEvents.beforeSending(config => {
  const headers: any = config.headers;

  if (user.isLoggedIn()) {
    headers.Authorization = `Bearer ${user.getAccessToken()}`;
  }

  headers["locale-code"] = currentLocaleCode();
});

endpointEvents.onSuccess((response: AxiosResponse) => {
  if (response?.data.data) {
    response.data = response.data.data;
  }

  if (response?.data.user) {
    user.update(response.data.user);
    userAtom.update(response.data.user);
  }

  if (response?.data?.cart) {
    cartAtom.update(response.data.cart);
  }

  if (response?.data?.addresses) {
    addressesAtom.update(response.data.addresses);
  }
});

endpointEvents.onError(response => {
  if (response?.data?.data) {
    response.data = response.data.data;
  }

  if (response?.status === 401) {
    user.logout();
    navigateTo(URLS.auth.login);
  }
});

setCurrentEndpoint(endpoint);

export default endpoint;
