/*
  # Add city_image + index_city to cities

  Adds:
    - `city_image` (text) - listing/card image URL
    - `index_city` (boolean) - show on homepage (max 12 enforced in app layer)
*/

ALTER TABLE cities
  ADD COLUMN IF NOT EXISTS city_image text DEFAULT '';

ALTER TABLE cities
  ADD COLUMN IF NOT EXISTS index_city boolean NOT NULL DEFAULT false;

