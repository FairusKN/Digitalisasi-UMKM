<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create("order_items", function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid("order_id")->constrained()->cascadeOnDelete();
            $table->foreignUuid("product_id")->constrained()->restrictOnDelete();
            $table->integer("quantity");
            $table->decimal("price", 12, 2); // Price at time of order
            $table->timestamps();

            $table->index('order_id');
            $table->index('product_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists("order_items");
    }
};
