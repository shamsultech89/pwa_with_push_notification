class CreateSubscriptions < ActiveRecord::Migration[5.2]
  def change
    create_table :subscriptions do |t|
      t.text :endpoint
      t.string :p256dh
      t.string :auth

      t.timestamps
    end
  end
end
