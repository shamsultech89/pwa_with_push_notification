class AddImageAndVideoIndexToProducts < ActiveRecord::Migration[5.2]
  def change
    add_index :products, :image
    add_index :products, :video
  end
end
