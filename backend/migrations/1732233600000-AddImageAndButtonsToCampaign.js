const { MigrationInterface, QueryRunner, TableColumn } = require('typeorm');

module.exports = class AddImageAndButtonsToCampaign1732233600000 {
  async up(queryRunner) {
    // Add imageUrl column
    await queryRunner.addColumn(
      'campaigns',
      new TableColumn({
        name: 'imageUrl',
        type: 'varchar',
        isNullable: true,
      })
    );

    // Add buttons column (JSON)
    await queryRunner.addColumn(
      'campaigns',
      new TableColumn({
        name: 'buttons',
        type: 'text',
        isNullable: true,
      })
    );
  }

  async down(queryRunner) {
    await queryRunner.dropColumn('campaigns', 'imageUrl');
    await queryRunner.dropColumn('campaigns', 'buttons');
  }
};
