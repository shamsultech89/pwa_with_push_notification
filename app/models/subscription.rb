class Subscription < ApplicationRecord
  validates :endpoint, :auth, :p256dh, presence: true

  belongs_to :product, optional: true
end
