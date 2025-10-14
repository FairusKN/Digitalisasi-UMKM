<?php

use App\PaymentMethod;
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
        Schema::create('orders', function (Blueprint $table) {
            $table->uuid("id")->primary();
            $table->foreignUuid("user_id")->constrained()->restrictOnDelete();
            $table->decimal("total", 12, 2);
            $table->text("note")->nullable();
            $table->boolean("is_takeaway")->default(false);
            $table->enum("payment_method", array_column(PaymentMethod::cases(), "value"));
            $table->timestamps();

            $table->index(["user_id", "created_at"]);
            $table->index("payment_method");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
