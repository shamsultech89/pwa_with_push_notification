class ApplicationController < ActionController::Base
  def send_notification(message, product = nil)
    client = WebpushClient.new
    Subscription.all.each do |subscription|
      log("sending message to #{subscription.endpoint}")
      response = client.send_notification(
        message,
        endpoint: subscription.endpoint,
        p256dh: subscription.p256dh,
        auth: subscription.auth,
        product: product
      )
      log(response ? "success" : "failed")
      # log(response.body.inspect)
    end
  end

  private

  def log(message)
    Rails.logger.info("[WebpushClient] #{message}")
  end
end
