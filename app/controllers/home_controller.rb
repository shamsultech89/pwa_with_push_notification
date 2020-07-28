class HomeController < ApplicationController
  def index
  end

  def push
    send_notification("Yay, you sent a push notification!")

    head :ok
  end

  def subscribe
    params.permit!

    if params[:endpoint]
      Subscription.find_by(endpoint: params[:endpoint])&.destroy
    elsif params.fetch(:subscription)
      subscription = params.fetch(:subscription).to_hash.with_indifferent_access
      unless Subscription.find_by(endpoint: subscription[:endpoint]).present?
        Subscription.create!(
          endpoint: subscription[:endpoint],
          p256dh: subscription.dig(:keys, :p256dh),
          auth: subscription.dig(:keys, :auth)
        )
      end
    end

    head :ok
  end
end
