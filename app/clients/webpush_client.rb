class WebpushClient
  def self.public_key
    ENV.fetch('VAPID_PUBLIC_KEY')
  end

  def self.public_key_bytes
    Base64.urlsafe_decode64(public_key).bytes
  end

  def self.private_key
    ENV.fetch('VAPID_PRIVATE_KEY')
  end

  # Send webpush message using subscription parameters
  #
  # @param message [String] text to encrypt
  # @param subscription_params [Hash<Symbol, String>]
  # @option subscription_params [String] :endpoint url to send encrypted message
  # @option subscription_params [Hash<Symbol, String>] :keys auth keys to send with message for decryption
  # @return true/false
  def send_notification(message, endpoint: "", p256dh: "", auth: "", product: nil)
    raise ArgumentError, ":endpoint param is required" if endpoint.blank?
    raise ArgumentError, "subscription :keys are missing" if p256dh.blank? || auth.blank?

    Rails.logger.info("Sending WebPush notification...............")
    # Rails.logger.info("message: #{message}")
    # Rails.logger.info("endpoint: #{endpoint}")
    # Rails.logger.info("p256dh: #{p256dh}")
    # Rails.logger.info("auth: #{auth}")
    begin
      Webpush.payload_send \
        message:  message_json(message, product),
        endpoint: endpoint,
        p256dh: p256dh,
        auth: auth,
        vapid: {
          subject: "mailto:shamsultech89@gmail.com",
          public_key: public_key,
          private_key: private_key
        }
    rescue => e
      Rails.logger.info("Exception raised while send notification: #{e.message}")
    end
  end

  def public_key
    self.class.public_key
  end

  def private_key
    self.class.private_key
  end

  def message_json(message, product)
    hash = { message: message }
    hash.merge!(url: "/products/#{product.id}", id: product.id) if product
    JSON.pretty_generate(hash)
  end
end
