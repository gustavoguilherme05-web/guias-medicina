import { onRequestPost as __api_auth_login_js_onRequestPost } from "C:\\Users\\Gustavo Guilherme\\Documents\\GitHub\\guias-medicina\\functions\\api\\auth\\login.js"
import { onRequestPost as __api_auth_register_js_onRequestPost } from "C:\\Users\\Gustavo Guilherme\\Documents\\GitHub\\guias-medicina\\functions\\api\\auth\\register.js"
import { onRequestGet as __api_auth_session_js_onRequestGet } from "C:\\Users\\Gustavo Guilherme\\Documents\\GitHub\\guias-medicina\\functions\\api\\auth\\session.js"
import { onRequestPost as __api_auth_session_js_onRequestPost } from "C:\\Users\\Gustavo Guilherme\\Documents\\GitHub\\guias-medicina\\functions\\api\\auth\\session.js"
import { onRequestGet as __api_forum_js_onRequestGet } from "C:\\Users\\Gustavo Guilherme\\Documents\\GitHub\\guias-medicina\\functions\\api\\forum.js"
import { onRequestPost as __api_forum_js_onRequestPost } from "C:\\Users\\Gustavo Guilherme\\Documents\\GitHub\\guias-medicina\\functions\\api\\forum.js"
import { onRequestPost as __api_osce_ai_js_onRequestPost } from "C:\\Users\\Gustavo Guilherme\\Documents\\GitHub\\guias-medicina\\functions\\api\\osce-ai.js"
import { onRequestPost as __api_prescricao_js_onRequestPost } from "C:\\Users\\Gustavo Guilherme\\Documents\\GitHub\\guias-medicina\\functions\\api\\prescricao.js"

export const routes = [
    {
      routePath: "/api/auth/login",
      mountPath: "/api/auth",
      method: "POST",
      middlewares: [],
      modules: [__api_auth_login_js_onRequestPost],
    },
  {
      routePath: "/api/auth/register",
      mountPath: "/api/auth",
      method: "POST",
      middlewares: [],
      modules: [__api_auth_register_js_onRequestPost],
    },
  {
      routePath: "/api/auth/session",
      mountPath: "/api/auth",
      method: "GET",
      middlewares: [],
      modules: [__api_auth_session_js_onRequestGet],
    },
  {
      routePath: "/api/auth/session",
      mountPath: "/api/auth",
      method: "POST",
      middlewares: [],
      modules: [__api_auth_session_js_onRequestPost],
    },
  {
      routePath: "/api/forum",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_forum_js_onRequestGet],
    },
  {
      routePath: "/api/forum",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_forum_js_onRequestPost],
    },
  {
      routePath: "/api/osce-ai",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_osce_ai_js_onRequestPost],
    },
  {
      routePath: "/api/prescricao",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_prescricao_js_onRequestPost],
    },
  ]