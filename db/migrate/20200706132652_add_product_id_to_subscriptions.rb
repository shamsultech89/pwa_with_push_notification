class AddProductIdToSubscriptions < ActiveRecord::Migration[5.2]
  def change
    add_column :subscriptions, :product_id, :string
    add_column :subscriptions, :references, :products
  end
end
