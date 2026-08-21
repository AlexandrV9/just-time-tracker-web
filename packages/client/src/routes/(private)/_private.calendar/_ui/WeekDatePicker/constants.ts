/** Формат ключа даты: используется как id слайда, ключ кэша и параметр запроса. */
export const DATE_KEY_FORMAT = "YYYY-MM-DD";

export const DAYS_IN_WEEK = 7;

/** Сколько недель генерируем в каждую сторону от опорной при старте и при прыжке по месяцу. */
export const INITIAL_SIDE_WEEKS = 12;

/** На сколько недель наращиваем ленту, когда подошли к её краю. */
export const GROW_BY_WEEKS = 12;

/** Запас в слайдах до края ленты, при котором запускается наращивание. */
export const EDGE_THRESHOLD_WEEKS = 2;
